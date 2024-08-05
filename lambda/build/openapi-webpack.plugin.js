const fs = require('fs');
const path = require('path');
const openapiSpec = JSON.stringify(require('./api-json.json'));

const rootPath = (pathStr) => path.join(__dirname, `../${pathStr}`);

// - get, post, put, delete, patch, _root
//    - none empty OBJ
// - httpMethods match openapi in _root
// a

class OpenApiWebpackPlugin {
  /**
   *
   * @param {import('webpack').Compiler} compiler
   */
  apply(compiler) {
    compiler.hooks.done.tap(OpenApiWebpackPlugin.name, (stats) => {
      const chunkGroups = stats.toJson().namedChunkGroups;
      const apiChunks = Object.keys(chunkGroups).filter((chunk) =>
        chunk.startsWith('api/'),
      );

      const paths = {};
      apiChunks.forEach((chunk) => {
        // const module = require(path.join(__dirname, 'dist', `${chunk}.js`));
        const module = require(rootPath(`./dist/${chunk}.js`));
        console.log('\n\n\nPLUGIN');
        const isRoute = chunk.startsWith('api/') && chunk.endsWith('/index');
        if (isRoute) {
          const path = chunk.split('/').slice(1, -1).join('/');
          // console.log({ path });
          // console.log(module.openapi);
          // console.log('\n');
          Object.assign(paths, module.openapi);
        }
      });
      console.log(paths);

      const openApiSpec = {
        openapi: '3.0.0',
        info: {
          title: 'My API',
          version: '1.0.0',
        },
        paths,
        // paths: {
        //   '/authss': {
        //     get: {
        //       responses: {
        //         // 200: {
        //         //   description: 'auth',
        //         // },
        //       },
        //     },
        //   },
        // },
      };

      fs.writeFileSync(
        // path.join(__dirname, '../dist/api-json.json'),
        rootPath('./dist/api-json.json'),
        // openapiSpec,
        JSON.stringify(openApiSpec),
      );

      //
      //
    });
  }
}
module.exports = OpenApiWebpackPlugin;
