{
  lib,
  stdenvNoCC,
  yarnConfigHook,
  yarnBuildHook,
  yarnInstallHook,
  fetchYarnDeps,
  nodejs,
  symlinkJoin,
}: let
  src = lib.fileset.toSource {
    root = ../..;
    fileset = lib.fileset.unions [
      ../../src
      ../../snapshots
      ../../.eslintrc.js
      ../../.prettierignore
      ../../.prettierrc
      ../../package.json
      ../../renovate.json
      ../../tsconfig.json
      ../../yarn.lock
    ];
  };

  mainYarnOfflineCache = fetchYarnDeps {
    yarnLock = src + "/yarn.lock";
    hash = "sha256-sG31c0HQJtfK2+4mqbVlviL2URMy4BTo24SdcEm2Oco=";
  };

  snapshotsYarnOfflineCache = fetchYarnDeps {
    yarnLock = src + "/snapshots/yarn.lock";
    hash = "sha256-fMtFY1l0q3D4uJJP/PAkRu9wUUvKAhpVFtIAiXvl2Nk=";
  };
in
  stdenvNoCC.mkDerivation {
    pname = "scip-typescript";
    version = "unstable";

    inherit src;

    yarnOfflineCache = symlinkJoin {
      name = "offine-cache";
      paths = [mainYarnOfflineCache snapshotsYarnOfflineCache];
    };

    nativeBuildInputs = [
      yarnConfigHook
      yarnBuildHook
      yarnInstallHook
      nodejs
    ];

    doCheck = true;
    checkPhase = ''
      runHook preCheck

      fixup-yarn-lock snapshots/yarn.lock
      yarn --offline prepare
      yarn --offline test

      yarn --offline run eslint
      yarn --offline run prettier-check

      runHook postCheck
    '';

    postInstall = ''
      mv $out/bin/@sourcegraph/scip-typescript $out/bin/scip-typescript
      rmdir $out/bin/@sourcegraph
    '';
  }
