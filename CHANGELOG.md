# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
### Changed
### Removed
### Fixed


## [4.10.1]
### Added
### Changed
- issue-58: Changed harmony submit call from GET to POST.
- feature-29: updated docker node version to 20.12.1 (the most current long term support version).
### Removed
### Fixed

## [4.10.0]
### Added
### Changed
### Removed
- issue-24: Removed last references to on-prem l2ss and podaac-tools.
### Fixed

## [4.9.8]
### Added
- Update github actions to have commit message trigger deploys.
- PODAAC-5326: Fixed 'Add matching granules to download' button.
### Changed
### Removed
### Fixed

## [4.9.7]
### Added
- Implement github actions workflow
- Moved source to github.com
### Changed
### Removed
### Fixed

## [4.9.4]
### Added
- PODAAC-5091: Remove temporal subsetting temporarily as the hitide ui doesn't support this feature.
### Changed
- Fixed dependabot alerts: jsonwebtoken, json5
### Removed
### Fixed

## [4.9.3]
### Added
- PODAAC-3512: Add CMR endpoint which forwards requests to cmr along with edl token
- PODAAC-3512: Handle subsets with grouped variables
### Changed
### Removed
### Fixed

## [4.9.2]
### Added
### Changed
- PODAAC-4583: Add skipPreview=true to Harmony requests made from HiTIDE
- PODAAC-4531: Remove request library, replaced with node-fetch
### Removed
### Fixed

## [4.9.1]
### Added
### Changed
- PODAAC-4319: Removed turbo param from harmony requests
### Removed
### Fixed

## [4.9.0]
### Added
- PODAAC-4254: Constrained terraform/aws provider version to less than v4
- PODAAC-3861: Enable concatenation for harmony subsets
- PODAAC-3606: Integration tests
- PODAAC-3612: Enable harmony subset requests
- PODAAC-3601: Terraform configurations for hitide-profile
### Changed
### Removed
### Fixed

