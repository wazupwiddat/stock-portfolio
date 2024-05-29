import Vue from 'vue';
import Router from 'vue-router';
import UserHome from '@/components/UserHome';
import UserSignup from '@/components/UserSignup';
import UserLogin from '@/components/UserLogin';
import UserAccounts from '@/components/UserAccounts';
import UserTransactions from '@/components/UserTransactions';
import UserPositions from '@/components/UserPositions';
import ImportTransactions from '@/components/ImportTransactions';

Vue.use(Router);

function isAuthenticated(to, from, next) {
  var authed = false;
  if (localStorage.getItem("token")) {
    authed = true;
  }
  if (authed) {
    next();
  } else {
    if (to.fullPath != '/login') {
      next('/login');
    } else {
      next();
    }
  }
}

export default new Router({
  mode: 'history',
  routes: [
    { path: '/', component: UserHome },
    { path: '/signup', component: UserSignup },
    { path: '/login', component: UserLogin },
    { 
      path: '/protected/accounts', 
      component: UserAccounts,
      beforeEnter: isAuthenticated 
    },
    { 
      path: '/protected/transactions', 
      component: UserTransactions,
      beforeEnter: isAuthenticated 
    },
    { 
      path: '/protected/positions', 
      component: UserPositions,
      beforeEnter: isAuthenticated 
    },
    { 
      path: '/protected/transactions/import', 
      component: ImportTransactions,
      beforeEnter: isAuthenticated 
    },
  ],
});
