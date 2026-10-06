# Project Architecture Rules

- Keep ALFA Brain graph data in a typed local module and render it through a dedicated D3 component, because source provenance and visualization behavior must remain independently maintainable.
- Model external automation such as n8n as protected graph topology only until a real connection is authorized, because visualization must never imply live execution.
- Keep Golden Orb examples browser-local, deterministic, and explicitly labeled as simulation, because audit demonstrations must never trigger agents or external actions.
- Scope Gold-Black design tokens to the ALFA Brain page, because the existing portfolio pages retain their current theme.- Route all ALFA Brain panel events through `src/lib/incidentBus.ts`, because the incident timeline, escalations and signed reports must see one shared, ordered stream.
- Keep security primitives (split token, ledger, backup crypto, gateway guard, report signing) as pure libs under `src/lib` with vitest coverage, because UI panels are demos while the logic must stay verifiable.
- Hugging Face browser fetches only the public huggingface.co API client-side with validated params (whitelisted sorts/tasks, sanitized search, no keys), because it is a read-only catalog and must never imply model execution.
- Local file scanner runs only on user-picked folders via the File System Access API with hard entry/depth caps, because scanned data must never leave the browser or imply access to files the user did not grant.
