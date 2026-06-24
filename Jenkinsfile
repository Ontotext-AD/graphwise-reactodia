@Library('ontotext-platform@v0.1.51') _
pipeline {
    agent {
        label 'aws-small'
    }

    tools {
        nodejs 'nodejs-22'
    }

    stages {
        stage('Checkout Submodules') {
            steps {
                sh 'git submodule update --init --recursive'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Cypress Component Test') {
            steps {
                script {
                    dockerCompose.buildCmd(composeFile: 'docker-compose.yaml', options: ['--force-rm'])

                    def caughtError = false
                    catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                        try {
                            dockerCompose.upCmd(
                                environment: getUserUidGidPair(),
                                composeFile: 'docker-compose.yaml',
                                options: ['--abort-on-container-exit', '--exit-code-from cypress']
                            )
                        } catch (e) {
                            caughtError = true
                        }
                    }

                    if (caughtError) {
                        echo "Tests failed — archiving Cypress video artifacts."
                        archiveArtifacts allowEmptyArchive: true, artifacts: 'cypress/screenshots/**/*.png, cypress/videos/**/*.mp4'
                        error("Cypress tests failed, job failed.")
                    }

                    echo "Tests passed — skipping video artifacts."
                    dockerCompose.downCmd(
                        composeFile: 'docker-compose.yaml',
                        options: ['--volumes', '--remove-orphans', '--rmi', 'local'],
                        ignoreErrors: true
                    )
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Build completed successfully!'
        }
        failure {
            echo 'Build failed!'
        }
    }
}

def getUserUidGidPair() {
    def uid = sh(script: 'id -u', returnStdout: true).trim()
    def gid = sh(script: 'id -g', returnStdout: true).trim()
    return [UID: uid, GID: gid]
}
