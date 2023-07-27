import { createRouter, createWebHistory } from 'vue-router';
import App from '../App.vue';
import { Score } from '../modules/Score';

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
    {
      path: '/:pathMatch(.*)*',
      component: App,
      async beforeEnter(to, from, next) {
        try {
          let response = await fetch(`/scores${to.path}.json`);
          let scoreRawObj = await response.json();
          to.meta.score = Score.loadFromRawObj(scoreRawObj);
          next();
        }
        catch {
          next({ path: '' });
        }
      },
      props: route => ({ score: route.meta.score }),
    },
    {
      path: '',
      component: App,
    },
  ],
})

export default router
