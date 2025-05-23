export const validateRequestBodyKeys = (requiredKeys: string[]) => {
    return (req: any, res: any, next: any) => {
        let _ = [];
        for (let key of requiredKeys) {
            if (!req.body?.[key]) {
                _.push({
                    field: key,
                    message: `${key} is required`
                })
            }
        }
        if (_?.length) return res.status(400).send({ errors: _ });
        next();
    };
};