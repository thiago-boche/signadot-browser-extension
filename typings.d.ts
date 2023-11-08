// Allows us to import CSS Module files from Typescript without the compiler showing errors
// due to not knowing how to find one of these "modules". Normally it only knows how to
// find .ts and .tsx files as modules.
declare module "*.module.css";