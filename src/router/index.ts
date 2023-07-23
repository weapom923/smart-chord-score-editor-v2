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
        if (['/', ''].includes(to.path)) {
          let scoreJsonFromCookie = window.localStorage.getItem('score');
          if (scoreJsonFromCookie !== null) {
            to.meta.score = Score.loadJson(scoreJsonFromCookie);
          } 
          next();
        } else {
          try {
            let response = await fetch(`/scores${to.path}.json`);
            let scoreRawObj = await response.json();
            to.meta.score = Score.loadFromRawObj(scoreRawObj);
          }
          finally {
            next();
          }
        }
      },
      props: route => ({ score: route.meta.score }),
    },
  ],
})

export default router
