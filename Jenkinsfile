pipeline {
    agent any
    stages {
        stage('Verificar Repositório') {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/main']], useRemoteConfigs: [[url: 'https://github.com/Gustasilvadev/schoolManager-ms6-notice-service']]])
            }
        }

        stage('Instalar Dependências') {
            steps {
                bat 'npm ci'
                bat 'npx prisma generate'
            }
        }

        stage('Construir Imagem Docker') {
            steps {
                script {
                    env.PATH = "C:\\Program Files\\Docker\\Docker\\resources\\bin;${env.PATH}"

                    def appName = 'schoolmanager-notice'
                    def imageTag = "${appName}:${env.BUILD_ID}"

                    bat "docker build -t ${imageTag} ."
                }
            }
        }

        stage('Fazer Deploy') {
            steps {
                script {
                    def appName = 'schoolmanager-notice'
                    def imageTag = "${appName}:${env.BUILD_ID}"

                    bat "docker stop ${appName} || echo 0"
                    bat "docker rm -v ${appName} || echo 0"
                    bat "docker run -d --name ${appName} -p 9516:9516 ${imageTag}"
                }
            }
        }
    }

    post {
        success {
            echo 'Deploy realizado com sucesso!'
        }
        failure {
            echo 'Houve um erro durante o deploy.'
        }
    }
}
