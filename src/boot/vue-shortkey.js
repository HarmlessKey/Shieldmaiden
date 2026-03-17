import shortkeyPlugin from 'src/directives/shortkey';

export default async ({ app }) => {
  app.use(shortkeyPlugin);
};
