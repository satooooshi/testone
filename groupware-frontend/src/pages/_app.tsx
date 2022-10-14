import '@/styles/globals.scss';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useRouter } from 'next/router';
import {
  AuthenticateProvider,
  useAuthenticate,
} from 'src/contexts/useAuthenticate';
import { ChakraProvider, extendTheme, Progress } from '@chakra-ui/react';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.scss';
import { useAPIAuthenticate } from '@/hooks/api/auth/useAPIAuthenticate';
import 'react-image-crop/dist/ReactCrop.css';
import 'draft-js/dist/Draft.css';
// import '@uiw/react-md-editor/dist/markdown-editor.css';
// import '@uiw/react-markdown-preview/dist/markdown.css';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';
import { BadgeProvider } from 'src/contexts/badge/useHandleBadge';

const AuthProvder: React.FC = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, authenticate, setUser } = useAuthenticate();
  const { mutate: mutateAuthenticate, isLoading } = useAPIAuthenticate({
    onSuccess: (userData) => {
      if (userData && userData.id) {
        authenticate();
        setUser(userData);
        if (router.pathname === '/login' || router.pathname === '/register') {
          router.push('/');
        }
      }
    },
    onError: () => {
      if (router.pathname !== '/login' && router.pathname !== '/register') {
        router.push('/login');
      }
    },
  });

  useEffect(() => {
    mutateAuthenticate();
  }, [mutateAuthenticate]);

  if (
    isLoading ||
    (!isAuthenticated &&
      router.pathname !== '/login' &&
      router.pathname !== '/forgot-password')
  ) {
    return <Progress isIndeterminate size="lg" />;
  }

  return children as React.ReactElement;
};

function MyApp({ Component, pageProps }: AppProps) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });

  const theme = {
    styles: {
      global: {
        'html, body': {
          background: '#f9fafb',
          lineHeight: '100%',
          fontFamily:
            "'游ゴシック体', YuGothic, '游ゴシック', 'Yu Gothic', sans-serif",
        },
      },
    },
    components: {
      Button: {
        baseStyle: {
          _focus: {
            boxShadow: 'none',
          },
        },
      },
      Link: {
        baseStyle: {
          _focus: {
            boxShadow: 'none',
          },
        },
      },
    },
    colors: {
      // Bold
      // brand: {
      //   50: '#EBF8FF',
      //   100: '#BEE3F8',
      //   200: '#90CDF4',
      //   300: '#63B3ED',
      //   400: '#4299E1',
      //   500: '#3182CE',
      //   600: '#2B6CB0',
      //   700: '#2C5282',
      //   800: '#2A4365',
      //   900: '#1A365D',
      // },

      // fanreturn
      brand: {
        50: '#FFF5F5',
        100: '#FED7D7',
        200: '#FEB2B2',
        300: '#FC8181',
        400: '#F56565',
        500: '#E53E3E',
        600: '#C53030',
        700: '#9B2C2C',
        800: '#822727',
        900: '#63171B',
      },
    },
  };
  const customTheme = extendTheme(theme);

  return (
    <ChakraProvider theme={customTheme}>
      <AuthenticateProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvder>
            <BadgeProvider>
              <Component {...pageProps} />
            </BadgeProvider>
          </AuthProvder>
        </QueryClientProvider>
      </AuthenticateProvider>
    </ChakraProvider>
  );
}
export default MyApp;
