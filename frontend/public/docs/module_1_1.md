# Module 1.1: The Single Qubit & Spatial State Space

## 🧪 1.0 The Physical Concept of a Qubit

A classical computer bit operates as an absolute discrete system—a microscopic transistor channel is either completely blocking current (Binary 0) or passing current (Binary 1).

A Quantum Bit, or **qubit**, breaks this classic paradigm by operating within a continuous, two-dimensional complex vector space called a **Hilbert Space** ($\mathcal{H}_{\mathbb{C}}^2$). This allows the system to occupy a state of **Superposition**, holding components of _both_ configurations simultaneously.

## 👁️ 2.0 The Paradox of Measurement & Superposition Collapse

Superposition is a state of raw mathematical potential. It exists only as long as the system remains completely isolated from the environment. **Superposition cannot be directly observed.**

The split second an external physical instrument measures or interacts with the qubit, the wave function instantly **collapses** into a deterministic classical state of either 0 or 1.

Which state it collapses into is entirely probabilistic. The precise odds are determined by the complex numbers $\alpha$ and $\beta$. The physical universe enforces a strict probability constraint: the sum of the squared absolute values of the amplitudes must always equal exactly 100% ($|\alpha|^2 + |\beta|^2 = 1$).

## 🧮 3.0 Guided Mathematical Validation Example

Let us trace a physical, coherent superposition state vector:
$$\vert\psi\rangle = 0.7071\vert0\rangle + 0.7071i\vert1\rangle$$

Here, the complex amplitude parameters are isolated as:

- $$\alpha = 0.7071 + 0.0000i$$
- $$\beta = 0.0000 + 0.7071i$$

### Step 1: Normalization Preservation Check

We verify that this state adheres to the absolute laws of physics:
$$|\alpha|^2 = (0.7071)^2 = 0.5000 \implies 50\%\text{ probability of collapsing into state }\vert0\rangle$$
$$|\beta|^2 = (0.7071)^2 = 0.5000 \implies 50\%\text{ probability of collapsing into state }\vert1\rangle$$
$$\text{Total System Probability} = 0.5000 + 0.5000 = 1.0000 \ (100\%)$$

### Step 2: Spherical Bloch Coordinate Extraction

Converting this state vector down to its observable angles on our 3D Bloch Canvas yields:

- Polar Angle Angle ($\theta$) = $$\pi / 2 \ (90^\circ)$$
- Azimuthal Angle Angle ($\phi$) = $$\pi / 2 \ (90^\circ)$$

Calculating the final 3D Cartesian coordinates ($x, y, z$) via our trigonometric equations:
$$x = \sin(90^\circ)\cos(90^\circ) = 1.0 \times 0.0 = 0.0$$
$$y = \sin(90^\circ)\sin(90^\circ) = 1.0 \times 1.0 = 1.0$$
$$z = \cos(90^\circ) = 0.0$$

The state vector points directly along the positive Y-axis tip, representing the definitive non-classical phase state ($|i+\rangle$).
