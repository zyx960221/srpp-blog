export default {
  menu: [
    {
      title: "技术经验",
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
          ],
        },
        // {
        //   title: "前端杂项",
        //   children: [
        //     {
        //       title: "字体分割",
        //       path: "/posts/vue-basics",
        //     },
        //   ],
        // },
      ],
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
