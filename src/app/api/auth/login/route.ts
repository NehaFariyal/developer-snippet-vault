import { NextResponse } from 'next/server';
import { findUserByEmail, createUser } from '@/lib/db';
import { verifyPassword, createSessionToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, isDemo } = body;

    // Handle instant Demo Developer Account login
    if (isDemo) {
      const existingDemo = await findUserByEmail('demo@snippetvault.dev');
      const demoUser = existingDemo || (await createUser({
        name: 'Alex Developer',
        email: 'demo@snippetvault.dev',
        passwordHash: 'demo',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      }));

      const token = await createSessionToken({
        id: demoUser.id,
        name: demoUser.name,
        email: demoUser.email,
        avatarUrl: demoUser.avatarUrl,
        createdAt: demoUser.createdAt,
      });

      const response = NextResponse.json({
        success: true,
        user: {
          id: demoUser.id,
          name: demoUser.name,
          email: demoUser.email,
          avatarUrl: demoUser.avatarUrl,
          createdAt: demoUser.createdAt,
        },
      });

      response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    // Standard credential login
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };

    const token = await createSessionToken(safeUser);

    const response = NextResponse.json({
      success: true,
      user: safeUser,
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to sign in. Please try again.' },
      { status: 500 }
    );
  }
}
