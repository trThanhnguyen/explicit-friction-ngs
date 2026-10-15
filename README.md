# Explicit Frictional Contact Modeling in Neural Garment Simulation

**Accepted at WACV 2027**

Thanh-Nguyen Truong<sup>1</sup>, Vu-Hoang Tran<sup>2</sup>, Ching-Chun Huang<sup>1</sup>
<sup>1</sup>National Yang Ming Chiao Tung University (NYCU), Taiwan ·
<sup>2</sup>Ho Chi Minh City University of Technology and Engineering (HCMUTE), Vietnam

**Project page:** https://trthanhnguyen.github.io/explicit-friction-ngs/

Graph-neural-network garment simulators leave body–garment friction implicit, with no friction
coefficient μ to set at inference. We attach a Modular Contact Operator to a frozen predictor —
no retraining, no iterative solve — that estimates the normal load, applies a closed-form Coulomb
correction along the body surface, and propagates the induced motion through the cloth. On HOOD
and ContourCraft it tracks a reference solver's μ-dependent response at an eighth of the solver's
runtime.

This repository hosts the project page.
