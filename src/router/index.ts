import { createRouter, createWebHistory } from 'vue-router';
import App from '../App.vue';
import { Score } from '../modules/Score';
import { RouteParamValue, LocationQuery } from 'vue-router';

const googleCloudStorageDownloadBaseUrl = 'https://storage.googleapis.com/storage/v1/b/scse-scores/o';

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
    {
      path: '/:pathMatch(.*)*',
      component: App,
      async beforeEnter(to, from, next) {
        let pathComponents = to.params.pathMatch as RouteParamValue[];
        if ('mode' in to.query) {
          switch (to.query['mode']) {
            case 'print':
              to.meta.print = true;
          }
        }
        const getPitchOffset = (query: LocationQuery): number => {
          if ('keyup' in query) {
            if (typeof query['keyup'] === "string") {
              const keyup = query['keyup'].match(/\d+/)?.[0];
              if (keyup) return Number(keyup);
            }
          }
          if ('keydown' in query) {
            if (typeof query['keydown'] === "string") {
              const keydown = query['keydown'].match(/\d+/)?.[0];
              if (keydown) return -Number(keydown);
            }
          }
          return 0;
        };
        const pitchOffset = getPitchOffset(to.query);
        try {
          let response = await fetch(
            `${googleCloudStorageDownloadBaseUrl}/${pathComponents.join('%2F')}.json?alt=media`,
            { headers: { 'Content-Type': 'application/json' } }
          )
          if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
          let scoreRawObj = await response.json();
          to.meta.score = Score.loadFromRawObj(scoreRawObj).transpose(pitchOffset);
          next();
        }
        catch (error) {
          console.error(error);
          next({ path: '' });
        }
      },
      props: route => ({
        score: route.meta.score,
        print: route.meta.print,
      }),
    },
    {
      path: '',
      component: App,
    },
  ],
})

export default router
