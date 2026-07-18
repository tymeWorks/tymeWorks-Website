# Statics Sandbox v0.1

## 1. Purpose

Statics Sandbox is an intuitive engineering tool that allows users to
construct a two-dimensional rigid-body model and examine static equilibrium
from first principles.

The purpose of the first version is not to solve a predefined beam or a
specific support configuration.

The solver will:

- Read the physical model created by the user.
- Determine the unknown support reactions from the model.
- Automatically generate the equilibrium equations.
- Evaluate whether the model can be solved using static equilibrium.
- Explain the results and model-related problems in clear language.

---

## 2. Core User Flow

1. The user opens the Statics Sandbox.
2. A rectangular rigid body is displayed in the scene.
3. The user adds supports to the body.
4. The user adds forces or applied moments.
5. The user selects objects and edits their properties.
6. The user clicks the Solve button.
7. The solver generates the equilibrium equations.
8. Reaction forces or model warnings are displayed.
9. The user may switch to a free-body-diagram view.

---

## 3. Supported Model

### Dimensions

- Two-dimensional plane
- Global x and y coordinate system
- Counterclockwise moments are positive

### Bodies

- One rigid body
- Initial visual representation: rectangle
- No body deformation
- Body mass and self-weight are not added automatically in v0.1

### Reference World

- Fixed ground
- Ground acts only as the reference to which supports are connected
- Direct contact between the body and ground is not solved

---

## 4. Supported Objects

### RigidBody

Properties:

- ID
- Center position
- Width
- Height
- Rotation angle

### Ground

Properties:

- Vertical position
- Visual length

Ground does not directly add forces to the equilibrium system.

### PinSupport

Creates two unknown reaction components:

- Horizontal reaction
- Vertical reaction

### RollerSupport

Creates one unknown reaction.

The reaction direction is normal to the support surface.

In v0.1, the default reaction direction is vertical.

### PointForce

Properties:

- Magnitude
- Direction or angle
- Application point
- Connected rigid body

### AppliedMoment

Properties:

- Magnitude
- Positive or negative direction
- Connected rigid body

---

## 5. Equilibrium Equations

The solver will generate the following three independent planar equilibrium
equations:

- Sum of horizontal forces equals zero
- Sum of vertical forces equals zero
- Sum of moments about a selected reference point equals zero

Matrix representation:

```text
A r = b
