// import common1 from "./common1";
// const common = ;
export default async () => {
  const { default: common, foo } = await import("./common1");
  return `<h1>This is state 2 -- using ${foo}</h1><ui-view id="state2"></ui-view>`;
};
