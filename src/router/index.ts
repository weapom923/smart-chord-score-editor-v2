import { createRouter, createWebHistory } from 'vue-router';
import App from '../App.vue';
import { Score } from '../modules/Score';
import { RouteParamValue } from 'vue-router';

const googleCloudStorageDownloadBaseUrl = 'https://storage.googleapis.com/storage/v1/b/scse-scores/o';

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
    {
      path: '/:pathMatch(.*)*',
      component: App,
      async beforeEnter(to, from, next) {
        let pathComponents = to.params.pathMatch as RouteParamValue[];
        try {
          let response = await fetch(
            `${googleCloudStorageDownloadBaseUrl}/${pathComponents.join('%2F')}.json?alt=media`,
            { headers: { 'Content-Type': 'application/json' } }
          )
          if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
          let scoreRawObj = await response.json();
          to.meta.score = Score.loadFromRawObj(scoreRawObj);
          next();
        }
        catch (error) {
          console.error(error);
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
