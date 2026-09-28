pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'binh9325/fruitweb'
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checkout FruitWeb from GitHub'
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Building FruitWeb Docker image...'

                sh '''
                    docker build -t ${DOCKER_IMAGE}:latest .
                '''
            }
        }

        stage('Docker Login') {
            steps {
                echo 'Logging in to Docker Hub...'

                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-cred',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    sh '''
                        echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
                    '''
                }
            }
        }

        stage('Docker Push') {
            steps {
                echo 'Pushing FruitWeb image to Docker Hub...'

                sh '''
                    docker push ${DOCKER_IMAGE}:latest
                '''
            }
        }

        stage('Docker Test') {
            steps {
                echo 'FruitWeb Docker image pushed successfully!'
            }
        }
    }

    post {
        success {
            echo 'FruitWeb CI - Build and Push completed successfully!'
        }

        failure {
            echo 'FruitWeb CI failed!'
        }
    }
}