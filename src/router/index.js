import Vue from 'vue';
import Router from 'vue-router';
import UserSignup from '@/components/UserSignup.vue';
import UserLogin from '@/components/UserLogin.vue';
import UserAccounts from '@/components/UserAccounts.vue';
import UserTransactions from '@/components/UserTransactions.vue';
import UserPositions from '@/components/UserPositions.vue';
import UserHome from '@/components/UserHome.vue';
import ImportTransactions from '@/components/ImportTransactions.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    { path: '/', component: UserHome },
    { path: '/signup', component: UserSignup },
    { path: '/login', component: UserLogin },
    { path: '/protected/accounts', component: UserAccounts },
    { path: '/protected/transactions', component: UserTransactions },
    { path: '/protected/positions', component: UserPositions },
    { path: '/protected/transactions/import', component: ImportTransactions },
  ],
});
