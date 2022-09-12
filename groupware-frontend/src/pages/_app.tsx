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
