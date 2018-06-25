module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jasmine: {
            options: {
                specs: ['jasmine/spec/capsula-capsule.js',
                    'jasmine/spec/capsula-context.js',
                    'jasmine/spec/capsula-def-capsule.js',
                    'jasmine/spec/capsula-errors.js',
                    'jasmine/spec/capsula-inheritance.js',
                    'jasmine/spec/capsula-operations.js',
                    'jasmine/spec/capsula-static.js',
                    'jasmine/spec/capsula-hooks-loops.js',
                    'jasmine/spec/html.js',
                    'jasmine/spec/services.js'
                ],
                helpers: 'jasmine/spec/helpers.js',
                vendor: 'jasmine/lib/jquery-3.2.1.min.js'
            },
            src: {
                src: ['src/services.js', 'src/capsula.js', 'src/html.js']
            },
            dist: {
                src: ['dist/services.js', 'dist/capsula.js', 'dist/html.js']
            }
        },
        jsdoc: {
            main: {
                src: 'src',
                dest: 'docs',
                options: {
                    configure: 'config/jsdoc/config.json',
                    readme: 'src/README.md'
                }
            }
        },
        clean: {
            docs: ['docs/*']
        },
        uglify: {
            compress: {
                files: {
                    'dist/services.js': 'src/services.js',
                    'dist/capsula.js': 'src/capsula.js',
                    'dist/html.js': 'src/html.js'
                },
                options: {
                    mangle: false,
                    compress: {
                        reduce_vars: false // this seems critical, must be false in order for tests to pass on compressed files
                    }
                }
            }
        },
        copy: {
            release: {
                options: {
                    process: function (content, srcpath) {
                        if (srcpath === 'package.json') {
                            var v = grunt.option('relver');
                            if (v == null || v.length === 0)
                                grunt.fail.fatal('Make sure you provide the release version (relver) argument: grunt release --relver=x.y.z');
                            return content.replace(/"version"\:\s".*"/, '"version": "' + v + '"');
                        } else {
                            return content;
                        }
                    }
                },
                files: [{
                        expand: true,
                        cwd: 'src',
                        src: '*.js',
                        dest: 'sandbox/scripts/lib/',
                        filter: 'isFile'
                    }, {
                        src: 'package.json',
                        dest: 'package.json'
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('test', ['jasmine:src']);
    grunt.registerTask('testdist', ['uglify:compress', 'jasmine:dist']);
    grunt.registerTask('docs', ['clean:docs', 'jsdoc']);
    grunt.registerTask('release', ['jasmine:src', 'uglify:compress', 'jasmine:dist', 'clean:docs', 'jsdoc', 'copy:release']);

    grunt.registerTask('default', []);
};
