/**
 * Função que cria uma nova instância de um middleware.
 *
 * Essa função deve ser implementada para fornecer uma nova instância de um
 * middleware sempre que for chamada. A instância criada deve aderir à
 * interface `Middleware<T, Q, C>`.
 *
 * @template T - Tipo da requisição.
 * @template Q - Tipo da resposta.
 * @template C - Tipo do contexto.
 * @template P - Tipo dos parâmetros ou configurações para criar o middleware.
 * @param {P} [props] - Os parâmetros ou configurações necessários para criar o middleware.
 * @returns {Middleware<T, Q, C>} - A nova instância do middleware criada pela fábrica.
 */
export type MiddlewareFactory<T, Q, C, P> = (props?: P) => Middleware<T, Q, C>;

/**
 * Tipo que representa a função de manipulação de erros.
 *
 * @template T - Tipo da requisição.
 * @template Q - Tipo da resposta.
 * @template C - Tipo do contexto.
 * @param {T} req - O objeto de requisição.
 * @param {Q} res - O objeto de resposta.
 * @param {C} context - O contexto da requisição.
 * @param {MiddlewareContext} _context - O contexto adicional do middleware.
 * @param {unknown} error - O erro ocorrido durante o processamento.
 * @returns {Promise<Q>} - Uma promessa que resolve no objeto de resposta atualizado.
 */
export type ErrorHandler<T, Q, C> = (req: T, context: C, _context: MiddlewareContext, error: unknown) => Promise<Q>;

/**
 * Tipo que representa uma função Handler.
 *
 * Um Handler é responsável por processar a última etapa de uma requisição e gerar a resposta final.
 * Ele é a última função na cadeia de middleware, sendo chamado após todos os middlewares terem sido executados.
 *
 * @template T - Tipo do objeto de requisição.
 * @template Q - Tipo do objeto de resposta.
 * @template C - Tipo do contexto da requisição.
 * @param {T} req - O objeto de requisição.
 * @param {Q} res - O objeto de resposta.
 * @param {C} context - O contexto da requisição.
 * @param {MiddlewareContext} _context - O contexto adicional do middleware.
 * @returns {Promise<Q>} - Uma promessa que resolve no objeto de resposta final processado.
 */
export type Handler<T, Q, C> = (req: T, context: C, _context: MiddlewareContext) => Promise<Q>;

/**
 * Interface que define a estrutura de um middleware.
 *
 * @template T - Tipo da requisição.
 * @template Q - Tipo da resposta.
 * @template C - Tipo do contexto.
 */
export interface Middleware<T, Q, C> {
    onError?: ErrorHandler<T, Q, C>;

    /**
     * Executa o middleware.
     *
     * @param {T} req - O objeto de requisição.
     * @param {Q} res - O objeto de resposta.
     * @param {C} context - O contexto da requisição.
     * @param {MiddlewareContext} _context - O contexto adicional do middleware.
     * @param {(req: T, res: Q, context: C, _context: MiddlewareContext) => Promise<Q>} next - A função que chama o próximo middleware na cadeia.
     * @returns {Promise<Q>} - Uma promessa que resolve no objeto de resposta atualizado.
     */
    run: (req: T, context: C, _context: MiddlewareContext) => Promise<MiddlewareContext>;
}

/**'
 * Tipo que representa o contexto compartilhado no middleware.
 * Contém informações adicionais processadas e extraídas da requisição.
 *
 * @property {object | undefined} body - O corpo da requisição, se presente, após parsing.
 * @property {object | undefined} data - Dados adicionais utilizados pelo middleware.
 * @property {object | undefined} queryStringParameters - Parâmetros de query string da requisição.
 * @property {object | undefined} pathParameters - Parâmetros de caminho da requisição.
 */
export type MiddlewareContext = {
    body: any | undefined,
    queryStringParameters: object | undefined,
    pathParameters: object | undefined
};

/**
 * Classe que gerencia e executa uma cadeia de middleware.
 *
 * @template T - Tipo da requisição.
 * @template Q - Tipo da resposta.
 * @template C - Tipo do contexto.
 */
export class Chain<T, Q, C> {
    /** @private {Middleware<T, Q, C>[]} - Lista de middlewares a serem executados. */
    private readonly middlewares: Middleware<T, Q, C>[];
    /** @private {ErrorHandler<T, Q, C>} - Manipulador de erros padrão. */
    private readonly defaultErrorHandler: ErrorHandler<T, Q, C>;
    /** @private {Q} - Resposta padrão para requisições bem-sucedidas. */
    private readonly defaultResponse: Q;
    /** @private {Handler<T, Q, C>} - Função Handler para a etapa final. */
    private resolver: Handler<T, Q, C>;
    /** @private {boolean} - Indicador de modo de depuração. */
    private readonly _debugger: boolean;

    /**
     * Cria uma nova instância da classe Chain.
     *
     * @param {ErrorHandler<T, Q, C>} defaultErrorHandler - Função de manipulação de erros padrão.
     * @param {Q} defaultResponse - Resposta padrão para requisições bem-sucedidas.
     * @param {boolean} [_debugger=false] - Modo de depuração (se true, retorna middlewareContext).
     */
    constructor(defaultErrorHandler: ErrorHandler<T, Q, C>,
                defaultResponse: Q,
                _debugger: boolean = false) {
        this.middlewares = [];
        this.defaultErrorHandler = defaultErrorHandler;
        this.defaultResponse = defaultResponse;
        this._debugger = _debugger;
    }

    /**
     * Adiciona um middleware à cadeia.
     *
     * @param {Middleware<T, Q, C>} middleware - O middleware a ser adicionado.
     * @returns {Chain<T, Q, C>} - A instância atual da classe Chain, permitindo encadeamento de métodos.
     */
    use(middleware: Middleware<T, Q, C>): Chain<T, Q, C> {
        this.middlewares.push(middleware);
        return this;
    }

    /**
     * Executa a cadeia de middlewares.
     *
     * @param {T} req - O objeto de requisição.
     * @param {C} context - O contexto da requisição.
     * @returns {Promise<Q>} - Uma promessa que resolve no objeto de resposta final.
     * @throws {HandlerNotDefinedError} - Se o handler não estiver definido na cadeia de middlewares.
     */
    async run(req: T, context: C): Promise<Q | MiddlewareContext> {
        let _context: MiddlewareContext = {
            body: undefined,
            queryStringParameters: undefined,
            pathParameters: undefined
        };

        if (!this.resolver && !this._debugger) {
            throw new HandlerNotDefinedError();
        }

        for (let i = 0; i < this.middlewares.length; i++) {
            const middleware = this.middlewares[i];

            try {
                _context = await middleware.run(req, context, _context);
            } catch (error: unknown) {
                if (middleware.onError) {
                    return await middleware.onError(req, context, _context, error);
                } else {
                    return this.defaultErrorHandler(req, context, _context, error);
                }
            }
        }

        if (this._debugger) {
            return _context;
        } else {
            return this.resolver(req, context, _context);
        }
    }

    /**
     * Define a função Handler para a etapa final da cadeia.
     *
     * @param {Handler<T, Q, C>} handler - A função Handler que processará a última etapa da requisição.
     * @returns {Chain<T, Q, C>} - A instância atual da classe Chain, permitindo encadeamento de métodos.
     */
    handler(handler: Handler<T, Q, C>): Chain<T, Q, C> {
        this.resolver = handler;
        return this;
    }
}

/**
 * Erro lançado quando um handler não está definido na cadeia de middlewares,
 * impedindo a execução final da cadeia.
 */
export class HandlerNotDefinedError extends Error {
    /**
     * Cria uma nova instância de HandlerNotDefinedError.
     * @param {string} [message] - Mensagem de erro opcional.
     */
    constructor(message: string = 'Handler not defined in the middleware chain.') {
        super(message);
        this.name = 'HandlerNotDefinedError';
    }
}
