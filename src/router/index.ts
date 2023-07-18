import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import App from '../App.vue';
import { Score } from '../modules/Score';
import { ScoreMetadata } from '../modules/ScoreMetadata';

const routes: RouteRecordRaw[] = [
  {
    path: '',
    component: App,
    async beforeEnter(to, from, next) {
      if (['/', ''].includes(to.path)) {
        let scoreJsonFromCookie = window.localStorage.getItem('score');
        if (scoreJsonFromCookie === null) {
          to.meta.score = new Score();
        } else {
          to.meta.score = Score.loadJson(scoreJsonFromCookie);
        } 
      } else {
        try {
          let response = await fetch(`/scores${to.path}.json`);
          let scoreRawObj = await response.json();
          to.meta.score = Score.loadFromRawObj(scoreRawObj);
        } catch {
          to.meta.score = new Score(new ScoreMetadata('Untitled'));
        }
      }
      next();
    },
    props: route => ({ score: route.meta.score }),
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
