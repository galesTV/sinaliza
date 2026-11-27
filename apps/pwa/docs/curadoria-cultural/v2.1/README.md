# Curadoria cultural V2.1 — preservação documental

Documentação editorial interna da área Explorar. Este material **não é conteúdo aprovado para publicação**, não é fonte runtime e não altera o catálogo tipado.

## Relação entre V2 e V2.1

A V2 é o pacote editorial original arquivado em `../v2/pacote-original/`, com 41 registros candidatos, 31 afirmações individualizadas e materiais de proveniência. A V2.1 é uma complementação derivada das rodadas de pesquisa R.1–R.5.2: preserva a matriz original, acrescenta propostas de evidência complementar e registra recuperações de evidência, sem promover revisão especializada nem autorização de publicação.

A V2.1 não substitui a V2 nem o catálogo runtime. Ela depende da V2 para o contexto original e permanece um artefato documental intermediário.

## Proveniência do pacote

O pacote foi recebido como `sinaliza-curadoria-complementar-v2.1.zip` na sessão da auditoria R.5.3-A.

SHA-256 do ZIP recebido: `38644a5a22c0f9d6b89d840601828c1725e58389b201cb7f61b4a72ce6ce10d3`.

`pacote-original/` contém uma cópia byte a byte dos 11 arquivos extraídos do ZIP. Esses arquivos não devem ser editados nesta estrutura. Qualquer normalização futura precisa ser produzida como documento derivado separado, com hash próprio; hashes do manifesto original nunca devem ser reapresentados como hashes de arquivos modificados.

`auditoria-r53a.md` é documento derivado da auditoria R.5.3-A, acrescido de uma seção explícita de erratas e ressalvas. Ele não pertence ao pacote original e não está coberto pelo manifesto da V2.1.

## Estrutura dos arquivos

- `README.md`: orientações e limitações do pacote complementar.
- `acervo-complementar.json`: 14 registros prioritários, corpos preservados/revisado e claimIds candidatos.
- `auditoria-v2.1.json`: contagens estruturais e limitações declaradas.
- `claims-complementares.json`: 22 propostas de novas afirmações.
- `claims-recuperadas.json`: 5 recuperações de evidência de afirmações originais.
- `decisoes-editoriais.md`: decisões editoriais e ressalvas registradas.
- `direitos-e-permissoes.md`: regras e limitações de direitos.
- `manifesto-sha256.json`: hashes dos outros 10 arquivos do pacote.
- `matriz-afirmacoes-consolidada.json`: matriz consolidada com 53 afirmações.
- `prompt-devin.md`: instrução original de auditoria somente leitura.
- `referencias-verificadas.json`: agregação de evidências por URL.

## Contagens independentes

Contagens recalculadas na auditoria R.5.3-A e na preservação R.5.3-B.1:

| Item | Quantidade |
|---|---:|
| Arquivos no pacote extraído | 11 |
| Entradas no manifesto V2.1 | 10 |
| Claims originais V2 preservados na matriz consolidada | 31 |
| Claims complementares | 22 |
| Claims recuperados | 5 |
| Afirmações consolidadas | 53 |
| Registros prioritários | 14 |
| Corpos originais preservados | 13 |
| Corpos revisados | 1 (`BIB-011`) |

O manifesto não inclui hash de si mesmo.

## Como verificar os manifestos

Na raiz do repositório, a verificação pode ser feita sem alterar os arquivos:

```bash
cd apps/pwa/docs/curadoria-cultural/v2.1/pacote-original
python3 - <<'PY'
import hashlib, json, pathlib
manifest = json.loads(pathlib.Path("manifesto-sha256.json").read_text())
for name, expected in manifest.items():
    digest = hashlib.sha256(pathlib.Path(name).read_bytes()).hexdigest()
    if digest != expected:
        raise SystemExit(f"hash divergente: {name}")
print("10/10 hashes válidos")
PY
```

A V2 original permanece verificável separadamente em `../v2/pacote-original/manifesto-sha256.json`; na preservação deste pacote, seus 16 hashes foram confirmados sem modificação dos arquivos.

## Evidência, revisão especializada e autorização

Os estados `content-checked`, `metadata-checked` e `located` são estados editoriais de proveniência. Eles não significam revisão especializada, aprovação factual final nem autorização de publicação.

Nenhum claim, referência ou corpo desta pasta foi migrado para o runtime nesta etapa. Nenhuma decisão de migração registrada nos documentos deve ser lida como executada ou definitivamente autorizada.

## Direitos e uso público

- Este arquivamento não altera direitos, permissões, reviews, autorizações, flags, Supabase ou o DTO público.
- A estratégia permanece `external-link-only`.
- A declaração de reprodução relacionada a `BIB-003` não autoriza automaticamente uso de capa, ilustrações, materiais de terceiros ou qualquer ativo específico.
- Nenhum conteúdo desta pasta pode ser exposto publicamente por importação runtime.

## Manifesto V2.1 conferido

| Arquivo original | SHA-256 |
|---|---|
| `README.md` | `774fec5bb49362d242ffef40e747f848492e85b447c5b1da3d7ea4f41d684298` |
| `acervo-complementar.json` | `d36bf2f06282af2516648b84172fcbc3700587c20e07d21a64e6633f43bb3a4e` |
| `auditoria-v2.1.json` | `d06d307596a376ff1d4fcf8f3052c8717028f555255783b33f4e29d822829272` |
| `claims-complementares.json` | `d039920cd4c1dcd2b1bf64b97ffca0ad84b3c81c63169f5b901aa3645e50c664` |
| `claims-recuperadas.json` | `2283083fc95ea5358705562a50b21e946097721c0a9d509b2133a9a855594eb6` |
| `decisoes-editoriais.md` | `454d3a1a602da172556e6e63abab2bf98c14e75b0601ffd4ce22dbd0da2fa0d3` |
| `direitos-e-permissoes.md` | `b52fae011f10096f07c82e85fc0cd4cc51d7e07bfd86db005071e2fee85491b1` |
| `matriz-afirmacoes-consolidada.json` | `89de3088dd30d374f59860b2f79e356a8e7d5bd3313b86a80fc359a34e3a1336` |
| `prompt-devin.md` | `de4f3e4ae2fc047779a1f25fa532ce2aba8f0178d5ad6fc23974d6569df7362a` |
| `referencias-verificadas.json` | `402e437af0447657f99f48e80b63edea560c95f4696cf1f690dddf4e4840404e` |

## Caráter deste PR

Este PR é exclusivamente documental. Ele preserva a proveniência da V2.1 e a auditoria aprovada, mas não migra claims, referências, corpos editoriais, versões, fingerprints, direitos ou qualquer dado operacional.
