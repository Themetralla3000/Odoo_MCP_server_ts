import { describe, it, expect } from 'vitest';
import { ZodError } from 'zod';
import { GetProjectsSchema } from '../../src/modules/projects/schemas.js';
import { SearchTasksSchema } from '../../src/modules/tasks/schemas.js';
import { SearchUsersSchema, GetUsersDetailsSchema } from '../../src/modules/users/schemas.js';
import {
  CreateTimesheetSchema,
  GetTaskTimesheetsSchema,
  DeleteTimesheetInput,
} from '../../src/modules/timesheets/schemas.js';
import {
  UpdateProjectStateInput,
  GetProjectStateInput,
  GetProjectsByStateInput,
} from '../../src/modules/kanban/schemas.js';

// --- projects ---

describe('GetProjectsSchema', () => {
  it('acepta input vacío con límite default 20', () => {
    const result = GetProjectsSchema.parse({});
    expect(result.limit).toBe(20);
    expect(result.stage_name).toBeUndefined();
  });

  it('acepta stage_name opcional', () => {
    const result = GetProjectsSchema.parse({ stage_name: 'DONE', limit: 5 });
    expect(result.stage_name).toBe('DONE');
    expect(result.limit).toBe(5);
  });

  it('rechaza límite no numérico', () => {
    expect(() => GetProjectsSchema.parse({ limit: 'muchos' })).toThrow(ZodError);
  });
});

// --- tasks ---

describe('SearchTasksSchema', () => {
  it('acepta input vacío con límite default 10', () => {
    const result = SearchTasksSchema.parse({});
    expect(result.limit).toBe(10);
  });

  it('acepta todos los campos opcionales', () => {
    const result = SearchTasksSchema.parse({ keyword: 'bug', project: 'MWC', assignee: 'Joan', tag: 'Urgente', limit: 3 });
    expect(result.keyword).toBe('bug');
    expect(result.limit).toBe(3);
  });

  it('rechaza límite no numérico', () => {
    expect(() => SearchTasksSchema.parse({ limit: 'diez' })).toThrow(ZodError);
  });
});

// --- users ---

describe('SearchUsersSchema', () => {
  it('acepta input vacío con límite default 20', () => {
    const result = SearchUsersSchema.parse({});
    expect(result.limit).toBe(20);
  });

  it('acepta query opcional', () => {
    const result = SearchUsersSchema.parse({ query: 'arnau' });
    expect(result.query).toBe('arnau');
  });

  it('rechaza límite no numérico', () => {
    expect(() => SearchUsersSchema.parse({ limit: 'todos' })).toThrow(ZodError);
  });
});

describe('GetUsersDetailsSchema', () => {
  it('acepta un array de ids numéricos', () => {
    const result = GetUsersDetailsSchema.parse({ ids: [1, 2, 3] });
    expect(result.ids).toEqual([1, 2, 3]);
  });

  it('rechaza ids sin el campo requerido', () => {
    expect(() => GetUsersDetailsSchema.parse({})).toThrow(ZodError);
  });

  it('rechaza ids con strings en el array', () => {
    expect(() => GetUsersDetailsSchema.parse({ ids: ['uno'] })).toThrow(ZodError);
  });
});

// --- timesheets ---

describe('CreateTimesheetSchema', () => {
  it('acepta task_id, description y hours requeridos', () => {
    const result = CreateTimesheetSchema.parse({ task_id: 42, description: 'Trabajo', hours: 1.5 });
    expect(result.task_id).toBe(42);
    expect(result.hours).toBe(1.5);
  });

  it('rechaza si falta task_id', () => {
    expect(() => CreateTimesheetSchema.parse({ description: 'x', hours: 1 })).toThrow(ZodError);
  });

  it('rechaza si falta hours', () => {
    expect(() => CreateTimesheetSchema.parse({ task_id: 1, description: 'x' })).toThrow(ZodError);
  });
});

describe('GetTaskTimesheetsSchema', () => {
  it('acepta task_id numérico', () => {
    const result = GetTaskTimesheetsSchema.parse({ task_id: 10 });
    expect(result.task_id).toBe(10);
  });

  it('rechaza si falta task_id', () => {
    expect(() => GetTaskTimesheetsSchema.parse({})).toThrow(ZodError);
  });
});

describe('DeleteTimesheetInput', () => {
  it('acepta timesheet_id numérico', () => {
    const result = DeleteTimesheetInput.parse({ timesheet_id: 7 });
    expect(result.timesheet_id).toBe(7);
  });

  it('rechaza si falta timesheet_id', () => {
    expect(() => DeleteTimesheetInput.parse({})).toThrow(ZodError);
  });
});

// --- kanban ---

describe('UpdateProjectStateInput', () => {
  it('acepta project_id y estado válido', () => {
    const result = UpdateProjectStateInput.parse({ project_id: 1, state: 'a_tiempo' });
    expect(result.state).toBe('a_tiempo');
  });

  it('rechaza estado fuera del enum', () => {
    expect(() => UpdateProjectStateInput.parse({ project_id: 1, state: 'verde' })).toThrow(ZodError);
  });

  it('rechaza si falta project_id', () => {
    expect(() => UpdateProjectStateInput.parse({ state: 'hecho' })).toThrow(ZodError);
  });
});

describe('GetProjectStateInput', () => {
  it('acepta project_id numérico', () => {
    const result = GetProjectStateInput.parse({ project_id: 5 });
    expect(result.project_id).toBe(5);
  });

  it('rechaza si falta project_id', () => {
    expect(() => GetProjectStateInput.parse({})).toThrow(ZodError);
  });
});

describe('GetProjectsByStateInput', () => {
  it('acepta state válido sin user_id', () => {
    const result = GetProjectsByStateInput.parse({ state: 'en_riesgo' });
    expect(result.state).toBe('en_riesgo');
    expect(result.user_id).toBeUndefined();
  });

  it('acepta user_id opcional', () => {
    const result = GetProjectsByStateInput.parse({ state: 'atrasado', user_id: 3 });
    expect(result.user_id).toBe(3);
  });

  it('rechaza estado fuera del enum', () => {
    expect(() => GetProjectsByStateInput.parse({ state: 'pendiente' })).toThrow(ZodError);
  });
});
