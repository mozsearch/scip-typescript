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
    hash = "sha256-vTIm/oo3+OP2ZUnafar4Pm6trlXLn/W+u1w/347hj/4==";
  };

  snapshotsYarnOfflineCache = fetchYarnDeps {
    yarnLock = src + "/snapshots/yarn.lock";
    hash = "sha256-7Gj4jpNVEYWDlYaoeZ9SAlFFbMjVpVAxO01HtJ5qcWs=";
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
