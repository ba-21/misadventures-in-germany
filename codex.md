# Global Rules

If a task involves frontend work, ALWAYS assume React + Vite + TypeScript unless explicitly told otherwise.

Be concise. Do not include explanations unless explicitly requested.


# Backend Standards (Java)

## Coding standards
- Use Java 21 features
- Prefer immutable data structures
- No Lombok
- Use constructor injection only

## Architecture
- Follow hexagonal architecture
- No business logic in controllers

## Testing
- Use JUnit 5 + AssertJ
- Always include edge cases


# Frontend Tech Stack (MANDATORY)

## Required stack
- React + Vite + TypeScript is REQUIRED for all frontend work
- Do not use alternative frameworks (Next.js, Create React App, etc.)

## Project creation
When creating a new frontend project, ALWAYS use:
pnpm create vite@latest <name> -- --template react-ts

## Scaffolding requirements
When asked to create a project, include:
- tsconfig.json
- vite.config.ts
- ESLint setup


# Frontend Conventions

## File conventions
- Components: `.tsx`
- Logic/utilities: `.ts`
- No `.js` or `.jsx` files

## React guidelines
- Functional components only
- Use hooks for state and lifecycle
- Avoid unnecessary useEffect
- Keep components small and composable

## TypeScript rules
- Always define explicit types for props
- Avoid `any`
- Prefer type inference when safe

## Vite rules
- Use vite.config.ts for configuration
- Do not introduce Webpack or other bundlers


# Anti-patterns (DO NOT DO)

- ❌ Using Create React App or Next.js
- ❌ Using JavaScript instead of TypeScript
- ❌ Adding unnecessary frameworks or dependencies
- ❌ Overengineering simple components
- ❌ Placing business logic inside controllers

## Enforcement

- These rules are strict and must be followed unless explicitly overridden by the user.
- If a request conflicts with these rules, ask for clarification before proceeding.
