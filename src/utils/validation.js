const { httpError } = require('./errors');

// Valida e converte un id. Se non è un intero positivo, lancia un 400.
function parseId(param, label = 'id') {

    const id = Number(param);
    if (!Number.isInteger(id) || id <= 0) {
        throw httpError(400, `Il parametro ${label} deve essere un numero valido.`);
    }
    return id;

};

// Valida il body di un intervallo (POST e PUT). Lancia 400 se non valido.
function validateIntervalBody(body) {

    const { start_date, end_date, user_id } = body;

    if (!start_date || !end_date || !user_id) {
        throw httpError(400, 'I campi start_date, end_date e user_id sono obbligatori.');
    };

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw httpError(400, 'Le date devono essere in formato YYYY-MM-DD valido.');
    };

    if (endDate < startDate) {
        throw httpError(400, 'La data di fine non può essere anteriore alla data di inizio.');
    };

};

// Valida il body di un utente (POST e PUT). Lancia 400 se non valido.
function validateUserBody(body) {

    const { email, first_name, last_name } = body;

    if (!email || !first_name || !last_name) {
        throw httpError(400, 'I campi email, first_name e last_name sono obbligatori.');
    };

}

// Valida il body di un goal (POST e PUT). Lancia 400 se non valido.
function validateGoalBody(body) {

    if (!body.name) {
        throw httpError(400, "Il nome dell'obiettivo è obbligatorio.");
    };
};

module.exports = {
    parseId,
    validateIntervalBody,
    validateUserBody,
    validateGoalBody
};
