import shutil
from pathlib import Path

root = Path(r"c:\practice\likevoca\batch")

sources = {
    'concepts': root / 'batch_1-1_concepts_template_add.csv',
    'examples': root / 'batch_1-1_examples_template_add.csv',
    'grammar': root / 'batch_1-1_grammar_template_add.csv',
}

created = []
skipped = []

for n in range(4, 41):
    for kind, src in sources.items():
        dest = root / f'batch_1-{n}_{kind}_template_add.csv'
        if dest.exists():
            skipped.append(str(dest))
            continue
        if not src.exists():
            raise FileNotFoundError(f"Source file missing: {src}")
        shutil.copy2(src, dest)
        created.append(str(dest))

print('Created files:')
for p in created:
    print(p)

print('\nSkipped (already existed):')
for p in skipped:
    print(p)
