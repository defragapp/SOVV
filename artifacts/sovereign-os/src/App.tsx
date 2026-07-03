import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter, Redirect, useLocation } from 'wouter';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from '@/components/PageTransition';

// Pages
import NotFound from '@/pages/not-found';
import { HomePage }           from '@/pages/HomePage';
import { AboutPage }          from '@/pages/AboutPage';
import { PricingPage }        from '@/pages/PricingPage';
import { HowItWorksPage }     from '@/pages/HowItWorksPage';
import { FaqPage }            from '@/pages/FaqPage';
import { ContactPage }        from '@/pages/ContactPage';
import { PrinciplesPage }     from '@/pages/PrinciplesPage';
import { PrivacyPage }        from '@/pages/PrivacyPage';
import { TermsPage }          from '@/pages/TermsPage';
import { UseCasesPage }       from '@/pages/UseCasesPage';
import { LoginPage }          from '@/pages/LoginPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage }  from '@/pages/ResetPasswordPage';
import { VerifyEmailPage }    from '@/pages/VerifyEmailPage';
import { DefragPage }         from '@/pages/DefragPage';
import { AlignmentPage }      from '@/pages/AlignmentPage';
import { CovenantPage }       from '@/pages/CovenantPage';
import { SettingsPage }       from '@/pages/SettingsPage';
import { HubBillingPage }     from '@/pages/HubBillingPage';
import { AdminPage }          from '@/pages/AdminPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

/** True for the interior app spaces — these use crossfade instead of push/pop */
function isAppSpace(path: string) {
  return path.startsWith('/apps/');
}

function AnimatedRoutes() {
  const [location] = useLocation();
  const variant = isAppSpace(location) ? 'crossfade' : 'push';

  return (
    <AnimatePresence mode="wait" initial={false}>
      <PageTransition key={location} variant={variant}>
        <Switch>
          {/* Marketing */}
          <Route path="/"             component={HomePage} />
          <Route path="/about"        component={AboutPage} />
          <Route path="/pricing"      component={PricingPage} />
          <Route path="/how-it-works" component={HowItWorksPage} />
          <Route path="/faq"          component={FaqPage} />
          <Route path="/contact"      component={ContactPage} />
          <Route path="/principles"   component={PrinciplesPage} />
          <Route path="/privacy"      component={PrivacyPage} />
          <Route path="/terms"        component={TermsPage} />
          <Route path="/use-cases"    component={UseCasesPage} />
          <Route path="/product"><Redirect to="/about" /></Route>

          {/* Auth */}
          <Route path="/login"><Redirect to="/app/login" /></Route>
          <Route path="/app/login"           component={LoginPage} />
          <Route path="/app/forgot-password" component={ForgotPasswordPage} />
          <Route path="/app/reset-password"  component={ResetPasswordPage} />
          <Route path="/app/verify-email"    component={VerifyEmailPage} />
          <Route path="/app"><Redirect to="/apps/defrag" /></Route>

          {/* App spaces */}
          <Route path="/apps/defrag"              component={DefragPage} />
          <Route path="/apps/defrag/workspace"    component={DefragPage} />
          <Route path="/apps/defrag/:id"          component={DefragPage} />
          <Route path="/apps/alignment"           component={AlignmentPage} />
          <Route path="/apps/alignment/workspace" component={AlignmentPage} />
          <Route path="/apps/covenant"            component={CovenantPage} />
          <Route path="/apps/covenant/workspace"  component={CovenantPage} />

          {/* Hub (legacy → redirect) */}
          <Route path="/hub/dashboard"><Redirect to="/apps/defrag" /></Route>
          <Route path="/hub/auth"><Redirect to="/app/login" /></Route>
          <Route path="/hub/billing"    component={HubBillingPage} />
          <Route path="/hub"><Redirect to="/apps/defrag" /></Route>

          {/* Tool (legacy) */}
          <Route path="/tool/:rest*"><Redirect to="/apps/defrag" /></Route>

          {/* Settings & admin */}
          <Route path="/settings" component={SettingsPage} />
          <Route path="/admin"    component={AdminPage} />

          {/* 404 */}
          <Route component={NotFound} />
        </Switch>
      </PageTransition>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <AnimatedRoutes />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
