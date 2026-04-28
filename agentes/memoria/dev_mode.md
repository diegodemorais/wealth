---
name: dev_mode
type: state
---

active: false

# Dev Mode State

Controlado por `/dev-mode on` e `/dev-mode off`.

Quando `active: true`: todas as mensagens de Diego sobre dashboard/pipeline
vão direto para o dev agent em vez do Head.

Alterado por: Head ao processar o comando, salva este arquivo.
