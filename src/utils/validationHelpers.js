const generateAssetTag = async () => {
  return `AST-${Date.now()}`;
};

module.exports = {
  generateAssetTag
};