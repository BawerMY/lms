import { CigarettesService } from './domains/cigarettes';

export interface Container {
  cigarettes: CigarettesService;
}

export function buildContainer(): Container {
  return {
    cigarettes: new CigarettesService(),
  };
}
