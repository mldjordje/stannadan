import NextAuth from 'next-auth';
import UserModel from '@auth/user/models/UserModel';
import type { NextAuthConfig } from 'next-auth';
import type { Provider } from 'next-auth/providers';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

const isProduction = process.env.NODE_ENV === 'production';
const googleConfigured = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

function resolveDefaultRoles(email?: string | null) {
	const adminEmails = (process.env.AUTH_ADMIN_EMAILS || '')
		.split(',')
		.map((item) => item.trim().toLowerCase())
		.filter(Boolean);
	const normalizedEmail = email?.toLowerCase() || '';

	if (!isProduction && normalizedEmail === 'admin@fusetheme.com') {
		return ['admin'];
	}

	return adminEmails.includes(normalizedEmail) ? ['admin'] : ['customer'];
}

const developmentCredentials = Credentials({
	name: 'Development admin',
	authorize(formInput) {
		if (isProduction || formInput.email !== 'admin' || formInput.password !== 'admin') {
			return null;
		}

		return {
			id: 'local-development-admin',
			email: 'admin@fusetheme.com',
			name: 'Development admin'
		};
	}
});

export const providers: Provider[] = [
	...(!isProduction ? [developmentCredentials] : []),
	...(googleConfigured ? [Google] : [])
];

const config = {
	theme: { logo: '/site-assets/images/logo/logo-white.png' },
	pages: {
		signIn: '/sign-in'
	},
	providers,
	basePath: '/auth',
	trustHost: true,
	callbacks: {
		authorized() {
			/** Checkout information to how to use middleware for authorization
			 * https://next-auth.js.org/configuration/nextjs#middleware
			 */
			return true;
		},
		jwt({ token, trigger, account, user }) {
			if (trigger === 'update') {
				token.name = user.name;
			}

			if (account?.provider === 'keycloak') {
				return { ...token, accessToken: account.access_token };
			}

			return token;
		},
		session({ session, token }) {
			if (token.accessToken && typeof token.accessToken === 'string') {
				session.accessToken = token.accessToken;
			}

			if (session?.user) {
				session.db = UserModel({
					id: session.user.email || token.sub || '',
					email: session.user.email || '',
					role: resolveDefaultRoles(session.user.email),
					displayName: session.user.name || session.user.email || '',
					photoURL: session.user.image || ''
				});
			}

			return session;
		}
	},
	experimental: {
		enableWebAuthn: true
	},
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60 // 30 days
	},
	debug: process.env.NODE_ENV !== 'production'
} satisfies NextAuthConfig;

export type AuthJsProvider = {
	id: string;
	name: string;
	style?: {
		text?: string;
		bg?: string;
	};
};

export const authJsProviderMap: AuthJsProvider[] = providers
	.map((provider) => {
		const providerData = typeof provider === 'function' ? provider() : provider;

		return {
			id: providerData.id,
			name: providerData.name,
			style: {
				text: (providerData as { style?: { text: string } }).style?.text,
				bg: (providerData as { style?: { bg: string } }).style?.bg
			}
		};
	})
	.filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth(config);
