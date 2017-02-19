// See http://brunch.io for documentation.
module.exports = {
  files: {
    javascripts: {
      joinTo: {
        'vendor.js': /^(?!app)/, // Files that are not in `app` dir.
        'app.js': /^app/
      }
    },
    stylesheets: {
      joinTo: {
        'vendor.css': /^node_modules|^vendor/,
        'app.css': /^app/,
      },
    },
  },

  npm: {
    styles: {
      'materialize-css': [
        'dist/css/materialize.min.css',
      ],
    },
  },

  plugins: {
    babel: { presets: ['latest'] },
    sass: true
  }

};
