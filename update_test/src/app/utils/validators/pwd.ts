import { Validators  } from '@angular/forms';

export const pwdValidator = Validators.pattern(/[a-zA-Z0-9\W]{8,}$/);

