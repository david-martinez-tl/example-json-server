pipeline {

    agent any


    /*
     * ============================================================
     * PIPELINE AS CODE
     * ============================================================
     *
     * Este Jenkinsfile se encuentra en la raíz del repositorio:
     *
     * https://github.com/david-martinez-tl/example-json-server
     *
     * El pipeline despliega exclusivamente la rama definida en
     * GIT_BRANCH.
     *
     *
     * Arquitectura:
     *
     *                  GitHub
     *                     │
     *                     │ HTTPS
     *                     ▼
     *                 Jenkins
     *                     │
     *                     │ SSH / rsync
     *                     ▼
     *                    app
     *                     │
     *                     ▼
     *                    PM2
     *                     │
     *                     ▼
     *                  Node.js
     *
     */


    stages {


        /*
         * ========================================================
         * 1. CHECKOUT
         * ========================================================
         */

        stage('Checkout') {

            steps {

                echo '''
                    ==========================================
                    CHECKOUT
                    ==========================================
                    '''

                deleteDir()

                git(
                    branch: env.GIT_BRANCH,
                    url: env.GIT_REPOSITORY
                )

                sh '''
                    set -e

                    echo "Repositorio:"
                    git remote get-url origin

                    echo ""
                    echo "Rama:"
                    git branch --show-current

                    echo ""
                    echo "Commit:"
                    git log -1 --oneline
                '''
            }
        }


        /*
         * ========================================================
         * 2. INSTALL DEPENDENCIES
         * ========================================================
         */

        stage('Install dependencies') {

            steps {

                echo '''
                    ==========================================
                    INSTALL DEPENDENCIES
                    ==========================================
                    '''

                sh '''
                    set -e

                    echo "Node:"
                    node --version

                    echo ""
                    echo "NPM:"
                    npm --version

                    echo ""
                    echo "Instalando dependencias..."

                    npm ci
                '''
            }
        }


        /*
         * ========================================================
         * 3. VALIDATE APPLICATION
         * ========================================================
         */

        stage('Validate application') {

            steps {

                echo '''
                    ==========================================
                    VALIDATE APPLICATION
                    ==========================================
                    '''

                sh '''
                    set -e

                    echo "Validando server.js..."

                    node --check server.js

                    echo ""
                    echo "Validación JavaScript OK."
                '''
            }
        }


        /*
         * ========================================================
         * 4. TEST SSH
         * ========================================================
         */

        stage('Test SSH connection') {

            steps {

                echo '''
                    ==========================================
                    TEST SSH CONNECTION
                    ==========================================
                    '''

                sshagent(
                    credentials: [env.SSH_CREDENTIAL_ID]
                ) {

                    sh '''
                        set -e

                        echo "Servidor:"
                        echo "${DEPLOY_HOST}"

                        echo ""
                        echo "Usuario:"
                        echo "${DEPLOY_USER}"

                        echo ""
                        echo "Probando conexión SSH..."

                        ssh \
                            -o StrictHostKeyChecking=no \
                            -o ConnectTimeout=10 \
                            "${DEPLOY_USER}@${DEPLOY_HOST}" \
                            "echo 'SSH CONNECTION OK'"
                    '''
                }
            }
        }


        /*
         * ========================================================
         * 5. DEPLOY
         * ========================================================
         */

        stage('Deploy application') {

            steps {

                echo '''
                    ==========================================
                    DEPLOY APPLICATION
                    ==========================================
                    '''

                sshagent(
                    credentials: [env.SSH_CREDENTIAL_ID]
                ) {

                    sh '''
                        set -e

                        echo "=========================================="
                        echo " DEPLOY"
                        echo "=========================================="

                        echo ""
                        echo "Servidor : ${DEPLOY_HOST}"
                        echo "Usuario  : ${DEPLOY_USER}"
                        echo "Destino  : ${DEPLOY_PATH}"


                        # ==================================================
                        # 1. CREAR DIRECTORIO
                        # ==================================================

                        echo ""
                        echo "1. Creando directorio de despliegue..."

                        ssh \
                            -o StrictHostKeyChecking=no \
                            -o ConnectTimeout=10 \
                            "${DEPLOY_USER}@${DEPLOY_HOST}" \
                            "mkdir -p '${DEPLOY_PATH}'"


                        # ==================================================
                        # 2. COPIAR ARCHIVOS
                        # ==================================================

                        echo ""
                        echo "2. Copiando archivos..."

                        rsync \
                            -az \
                            --delete \
                            --exclude='.git/' \
                            --exclude='node_modules/' \
                            --exclude='Jenkinsfile' \
                            ./ \
                            "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/"


                        # ==================================================
                        # 3. INSTALAR DEPENDENCIAS
                        # ==================================================

                        echo ""
                        echo "3. Instalando dependencias de producción..."

                        ssh \
                            -o StrictHostKeyChecking=no \
                            -o ConnectTimeout=10 \
                            "${DEPLOY_USER}@${DEPLOY_HOST}" \
                            "
                                set -e

                                cd '${DEPLOY_PATH}'

                                npm ci --omit=dev
                            "


                        # ==================================================
                        # 4. REINICIAR APLICACIÓN
                        # ==================================================

                        echo ""
                        echo "4. Reiniciando aplicación..."

                        ssh \
                            -o StrictHostKeyChecking=no \
                            -o ConnectTimeout=10 \
                            "${DEPLOY_USER}@${DEPLOY_HOST}" \
                            "
                                set -e

                                cd '${DEPLOY_PATH}'

                                if pm2 describe '${PM2_APP_NAME}' >/dev/null 2>&1
                                then

                                    echo 'Aplicación existente.'
                                    echo 'Reiniciando PM2...'

                                    pm2 restart '${PM2_APP_NAME}'

                                else

                                    echo 'Aplicación no existe.'
                                    echo 'Creando proceso PM2...'

                                    pm2 start npm \
                                        --name '${PM2_APP_NAME}' \
                                        -- start

                                fi

                                pm2 save

                                echo ''
                                echo 'Procesos PM2:'

                                pm2 list
                            "


                        echo ""
                        echo "Deploy terminado correctamente."
                    '''
                }
            }
        }


        /*
         * ========================================================
         * 6. HEALTH CHECK
         * ========================================================
         */

        stage('Health Check') {

            steps {

                echo '''
                    ==========================================
                    HEALTH CHECK
                    ==========================================
                    '''

                sshagent(
                    credentials: [env.SSH_CREDENTIAL_ID]
                ) {

                    sh '''
                        set -e

                        echo "Esperando que la aplicación esté disponible..."

                        sleep 3

                        echo ""
                        echo "Ejecutando Health Check..."

                        ssh \
                            -o StrictHostKeyChecking=no \
                            -o ConnectTimeout=10 \
                            "${DEPLOY_USER}@${DEPLOY_HOST}" \
                            "
                                curl \
                                    --fail \
                                    --silent \
                                    --show-error \
                                    --max-time 10 \
                                    http://127.0.0.1:${APP_PORT}${APP_HEALTH_PATH}
                            "

                        echo ""
                        echo "Health Check OK."
                    '''
                }
            }
        }
    }


    /*
     * ============================================================
     * POST
     * ============================================================
     */

    post {

        success {

            echo '''
                ==========================================
                DEPLOY EXITOSO
                ==========================================
                '''

            echo "Repositorio : ${GIT_REPOSITORY}"
            echo "Rama        : ${GIT_BRANCH}"
            echo "Servidor    : ${DEPLOY_HOST}"
            echo "Ruta        : ${DEPLOY_PATH}"
            echo "Aplicación  : ${PM2_APP_NAME}"
            echo "Puerto      : ${APP_PORT}"
            echo "Health      : ${APP_HEALTH_PATH}"
        }


        failure {

            echo '''
                ==========================================
                DEPLOY FALLIDO
                ==========================================

                Revisar los logs de Jenkins para identificar
                la etapa que produjo el error.
                '''
        }


        always {

            echo ""
            echo "Pipeline finalizado."
            echo "Build #${BUILD_NUMBER}"
        }
    }
}
