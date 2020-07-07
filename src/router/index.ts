import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Generator from "../views/Generator.vue";
import LiveStats from "../views/LiveStats.vue";
import PageNotFound from "../views/PageNotFound.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/live/:username",
    name: "Live Stats",
    component: LiveStats,
    props: true
  },
  {
    path: "/",
    name: "Link Generator",
    component: Generator
  },
  { path: "*", component: PageNotFound }
];

const router = new VueRouter({
  mode: "history",
  routes
});

export default router;
