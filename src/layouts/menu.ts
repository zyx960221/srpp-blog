export default {
  menu: [
    {
      title: "前端",
      path: "/posts/frontend",
      children: [
        {
          title: "微信公众号开发",
          children: [
            {
              title: "对接授权",
              path: "/posts/wx_OfficeAccountAuth",
            },
            // {
            //   title: "进阶主题",
            //   path: "/posts/js-advanced",
            // },
          ],
        },
        {
          title: "Vue3 使用",
          children: [
            // {
            //   title: "Vue 进阶",
            //   path: "/posts/vue-advanced",
            // },
            {
              title: "v-memo报错",
              path: "/posts/v_memo",
            },
            // {
            //   title: "虚拟列表实现（Vue）",
            //   path: "/posts/vue-advanced",
            // },
          ],
        },
        {
          title: "Vue3 源码",
          children: [
            {
              title: "框架设计",
              path: "/posts/vue/framework_design",
            },
            {
              title: "响应系统1",
              path: "/posts/vue/reactivity1",
            },
            // {
            //   title: "响应系统2",
            //   path: "/posts/vue/reactivity2",
            // },
          ],
        },
        // {
        //   title: "Git",
        //   children: [
        //     {
        //       title: "Git基础简介",
        //       path: "/posts/git/introduction",
        //     },
        //   ]
        // },
        {
          title: "前端杂项",
          children: [
            // {
            //   title: "字体分割",
            //   path: "/posts/vue-basics",
            // },
            {
              title: "vscode快速调试",
              path: "/posts/frontend_other/vscode_debug",
            },
          ],
        },
      ],
    },
    {
      title: "摄影",
      path: "/posts/photograph/index",
      children: [],
    },
    // {
    //   title: "读书分享",
    //   path: "/posts/backend",
    //   children: [
    //     {
    //       title: "成长/方法论",
    //       children: [
    //         {
    //           title: "思考的框架3",
    //           path: "/posts/node-basics",
    //         },
    //         {
    //           title: "精益创业",
    //           path: "/posts/node-advanced",
    //         },
    //       ],
    //     },
    //     {
    //       title: "文学",
    //       children: [],
    //     },
    //   ],
    // },
  ],
};
