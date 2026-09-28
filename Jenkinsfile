pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Checkout FruitWeb from GitHub'
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Build Docker image for FruitWeb'
                sh 'docker build -t fruitweb:jenkins .'
            }
        }

        stage('Docker Test') {
            steps {
                echo 'Docker image built successfully'
            }
        }
    }

    post {
        success {
            echo 'FruitWeb CI completed successfully!'
        }

        failure {
            echo 'FruitWeb CI failed!'
        }
    }
}