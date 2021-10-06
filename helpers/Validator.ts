type ValidatorSchema = {[key: string]: ValidatorFn[] | ValidatorSchema};
type ValidatorFn = (model: any) => Promise<ValidatorErrors | null> | ValidatorErrors | null;
type ValidatorErrors = {[key: string]: any};

class Control {
  public constructor(validators) {}
}

class Model {
  public constructor(schema) {}
  public value() {}
  public valid() {}
  public invalid() {}
  public errors() {}
}

class Validators {
  public static async validate(data: any, model: Model): Promise<{[key: string]: ValidatorErrors} | null> {
    return null;
  }
  public static compose(validators: ValidatorFn[]): ValidatorFn | null {
    return async (control: any) => {
      const errors = [];
      for (const validator of validators) {
        const error = await validator(control);
        errors.push(error);
      }
      return {[""]: errors};
    };
  }
}
