import {string} from "dynamodb-toolbox";

const toUpperCase = {
    parse: (input: string) => input.toUpperCase(),
    format: (input: string) => input.toUpperCase(),
}

export default toUpperCase;