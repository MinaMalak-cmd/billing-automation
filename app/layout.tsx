import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Roboto } from 'next/font/google';
import { Metadata } from 'next'; // Added for type safety (optional)

const roboto = Roboto({
      weight: ['300', '400', '500', '700'],
      subsets: ['latin'],
      display: 'swap',
      variable: '--font-roboto',
});
export const metadata: Metadata = {
    title: 'Payroll Automation',
    description: 'Manage employee payroll and exports',
    icons: {
        icon: '/favicon.ico', // This points to public/favicon.ico
    },
};

export default function RootLayout(props) {
    const { children } = props;
    return (
        <html lang="en" className={roboto.variable}>
            <body>
                <AppRouterCacheProvider>
                       {/*<ThemeProvider theme={theme}>*/}
                                {children}
                       {/*</ThemeProvider>*/}
                </AppRouterCacheProvider>
            </body>
        </html>
    );
}
