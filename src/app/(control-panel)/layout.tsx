import AuthGuardRedirect from '@auth/AuthGuardRedirect';
import AdminShell from '@/components/admin/AdminShell';

function Layout({ children }) {
	return (
		<AuthGuardRedirect auth={['admin']}>
			<AdminShell>{children}</AdminShell>
		</AuthGuardRedirect>
	);
}

export default Layout;
