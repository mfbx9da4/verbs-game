module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                // define a string to put between each file in the concatenated output
                separator: ';'
            },
            libs:  {
                src: [
                    "libs/jquery-2.0.3.min.js",
                    "libs/d3.v3.min.js",
                    "libs/simple-statistics.js",
                    "libs/angular-file-upload-shim.js",
                    "libs/angular.min.js",
                    "libs/angular-route.min.js",
                    "libs/angular-file-upload.js",
                    "style/js/bootstrap.min.js"
                ],
                dest: 'output/libs.js'
            },
            app: {
                // the files to concatenate
                src: [
                    'app/app.js',
                    'app/controllers.js'
                ],
                dest: 'output/app.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            app: {
                src: 'output/app.js',
                dest: 'output/app.min.js'
            },
            libs: {
                src: 'output/libs.js',
                dest: 'output/libs.min.js'
            }
        },
        jshint: {
            // define the files to lint
            files: ['<%= concat.app.src %>', 'server.js', 'server/routes.js', 'Gruntfile.js'],
            // configure JSHint (documented at http://www.jshint.com/docs/)
            options: {
                // more options here if you want to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true
                }
            }
        },
        watch: {
            files: ['<%= jshint.files %>', 'index.html', 'game.html', 'style/css/*.css'],
            tasks: ['jshint', 'concat:app', 'uglify:app'],
            options: {
                livereload: {
                    port: 12345
                }
            }
        }

    });
       
    // Default task(s).
    grunt.registerTask('default', ['concat', 'uglify', 'watch']);

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');

};

