import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuário inativo');
    }

    const tokens = await this.generateTokens(user.id);

    // Salvar refresh token no banco
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    // Remover senha do retorno e adicionar tenantName
    const { password, tenant, ...userWithoutPassword } = user;

    return {
      user: {
        ...userWithoutPassword,
        tenantName: tenant?.name || null,
      },
      ...tokens,
    };
  }

  async register(registerDto: RegisterDto) {
    // Verificar se email já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Este email já está cadastrado');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      this.config.get<number>('BCRYPT_ROUNDS') || 10,
    );

    // Buscar ou criar tenant se fornecido
    let tenantId = registerDto.tenantId;
    
    // Auto-detect OWNER role: primeiro usuário de um tenant recebe role OWNER
    let role: 'CUSTOMER' | 'BARBER' | 'ADMIN' | 'OWNER' = 'CUSTOMER';
    
    if (tenantId) {
      // Verificar se é o primeiro usuário deste tenant
      const userCount = await this.prisma.user.count({
        where: { tenantId },
      });
      
      if (userCount === 0) {
        role = 'OWNER';
        this.prisma.$extends({
          name: 'auto-owner-detection',
        });
      }
    }

    // Criar usuário com role detectado automaticamente
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
        phone: registerDto.phone,
        role,
        tenantId,
      },
    });

    const tokens = await this.generateTokens(user.id);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });

      // Verificar se o refresh token existe no banco
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Token inválido');
      }

      // Verificar se o token expirou
      if (storedToken.expiresAt < new Date()) {
        await this.prisma.refreshToken.delete({
          where: { id: storedToken.id },
        });
        throw new UnauthorizedException('Token expirado');
      }

      // Gerar novos tokens
      const tokens = await this.generateTokens(payload.sub);

      // Deletar o refresh token antigo
      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });

      // Salvar novo refresh token
      await this.saveRefreshToken(payload.sub, tokens.refreshToken);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  async logout(userId: string) {
    // Deletar todos os refresh tokens do usuário
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    return { message: 'Logout realizado com sucesso' };
  }

  private async generateTokens(userId: string) {
    const payload = { sub: userId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async saveRefreshToken(userId: string, token: string) {
    const expiresIn = this.config.get('JWT_REFRESH_EXPIRES_IN');
    const expiresAt = new Date();

    // Converter "7d" para dias
    const days = parseInt(expiresIn.replace('d', ''));
    expiresAt.setDate(expiresAt.getDate() + days);

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }
}
