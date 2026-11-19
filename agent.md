# MindBloom Specialist Portal --- Agent Instructions

## 1. Mission and scope

Build only the **MindBloom Specialist Portal** described in this file.

The portal is for specialists and includes only these modules: 1.
Specialist Dashboard 2. Bookings & Schedule 3. My Patients / Patient
Clinical Hub 4. Telehealth entry point (button only; no live video
implementation) 5. Activity Creator 6. Privacy & Consent enforcement 7.
Specialist Profile & Availability

Do not build the Mother App, Partner/Merchant Portal, Super Admin
Portal, marketplace, community, AI triage assistant, assessment games,
payment gateway, or any other module not explicitly listed above.

## 2. Mandatory working rules

-   Before changing code, inspect the existing repository structure,
    framework, dependencies, and current implementation.
-   Use the project's existing framework, conventions, components,
    styling system, and package manager.
-   Do not replace project configuration or rewrite existing
    functionality unnecessarily.
-   Implement only what is required in this document.
-   Do not invent extra features, pages, workflows, integrations, or
    business rules.
-   Do not add unnecessary libraries or dependencies.
-   Reuse existing components and patterns where possible.
-   Keep the implementation focused, maintainable, and consistent with
    the current codebase.
-   If a requirement cannot be implemented because necessary information
    or infrastructure is missing, do not guess. Leave the smallest
    appropriate integration point and clearly report the limitation.
-   Use realistic sample/mock data only where a real backend or
    integration is not available. Clearly keep mock behavior separate
    from production behavior.
-   Do not claim that a backend, database, notification, or external
    integration works unless it is actually connected and functional.

## 3. Specialist Dashboard

Provide a dashboard containing: - Today's sessions. - Pending booking
requests. - Number of patients currently assigned to the specialist. -
Upcoming appointments. - Quick navigation to patients, bookings, and
activity creation.

Do not add unrelated analytics or dashboard widgets.

## 4. Bookings & Schedule

Provide appointment sections or filters for: - Pending - Confirmed -
Past Sessions

For each booking, show the available appointment and child details,
including date, time, and session format.

The specialist must be able to: - Approve a booking request. - Reject a
booking request, with a mandatory written reason. - Propose an
alternative date and time.

A proposed alternative time must remain pending until the mother
approves it. Do not mark it as confirmed before approval.

Allow the specialist to manage their availability.

Do not implement payment processing or refunds unless already present
and explicitly required by the existing project scope.

## 5. My Patients / Patient Clinical Hub

-   Show only children who have both active parental consent for this
    specific child-specialist relationship and an active or recently
    completed appointment.
-   Do not provide global patient search or access to the platform-wide
    patient registry.
-   Do not expose records for children who do not satisfy the access
    conditions.

For an accessible patient, show the available information: - Basic child
information. - Developmental milestones history. - Behavioral
observations. - Assessment game scores. - AI triage history. - Previous
clinical notes written by the specialist.

The specialist can add and save clinical notes while access is valid.

The mother's observations and AI assessment/game scores are read-only.
Do not allow the specialist to edit them.

Do not invent clinical fields or generate medical diagnoses.

## 6. Telehealth --- button only

-   Keep a video-call button in the relevant appointment and patient
    views.
-   Do **not** implement live video calling, Jitsi, WebRTC, streaming,
    room creation, or video-provider integration at this stage.
-   The button is a placeholder for future implementation. It must not
    falsely imply that a live call has started.
-   Do not remove the button or replace it with a working external video
    link.

## 7. Activity Creator

Allow the specialist to create a personalized therapeutic activity for
an eligible patient.

Each activity includes only: - Activity title. - Step-by-step written
instructions. - Optional media attachment. - Estimated duration. -
Frequency or repetition. - Due date or end date.

After creation: - Make the activity available in the parent's Tier 3
Activities section when the relevant parent-side integration exists. -
Show completion status to the specialist only after the mother confirms
completion. - Allow the specialist to edit or retract an assigned
activity.

Do not add AI-generated activities, activity recommendations, or
unrelated task-management features.

## 8. Privacy and consent --- mandatory access rules

Clinical record access requires **both** conditions at the same time: 1.
Active parental consent for the specific child-specialist pair. 2. An
active or recently completed appointment.

Enforce these rules at the data/API access layer, not only by hiding
interface elements.

When consent is revoked: - Immediately deny further access to the
child's clinical records. - Prevent saving new clinical notes. - If
revocation happens during an already active video session, do not
terminate that existing session. Lock the clinical records and
note-saving only.

When the appointment expires, lock access to the clinical records.

Never bypass these checks for convenience, mock data, frontend
navigation, or direct API requests. If the current project has no
backend enforcement yet, clearly identify that limitation rather than
presenting frontend-only checks as secure enforcement.

## 9. Specialist Profile & Availability

Allow the specialist to manage: - Professional biography. - Clinical
specialty. - Session rates. - Availability. - Required professional
credential documents.

A specialist profile must remain hidden from public search until an
administrator has approved it. Do not build the administrator portal;
only represent the specialist-side verification/submission status if
needed.

## 10. Navigation and completion criteria

-   Connect the listed portal modules through the existing application
    navigation.
-   Ensure the described actions and state changes work within the
    available project infrastructure.
-   Keep the video-call button visible but non-functional as specified.
-   Do not create additional modules or screens outside this scope.

Before finishing: 1. Run the project's available checks (such as build,
lint, and tests) where possible. 2. Fix issues introduced by your
changes. 3. Summarize what was implemented. 4. List any mocked behavior,
missing backend integration, or requirement that could not be completed.
5. Confirm explicitly that no out-of-scope modules or live video
functionality were added.

## 11. Scope decision rule

If a requested change is not explicitly covered by this file, **do not
implement it automatically**. Ask for clarification before expanding the
scope.
