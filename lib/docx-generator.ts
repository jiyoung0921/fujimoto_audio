import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { promises as fs } from 'fs';
import path from 'path';
import { summarizeAndStructure } from './google-apis';

const MIN_CHARS_FOR_AI_SUMMARY = 500;

export async function generateDocx(
    transcriptionText: string,
    originalFilename: string,
    enableAISummary: boolean = true
): Promise<string> {
    let docChildren: Paragraph[] = [];

    // Header
    docChildren.push(
        new Paragraph({
            text: '音声文字起こし結果',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: `元ファイル: ${originalFilename}`,
                    bold: true,
                }),
            ],
            spacing: { after: 200 },
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: `作成日時: ${new Date().toLocaleString('ja-JP')}`,
                    italics: true,
                }),
            ],
            spacing: { after: 400 },
        })
    );

    // Check if AI summary should be applied
    const shouldUseAI = enableAISummary && transcriptionText.length >= MIN_CHARS_FOR_AI_SUMMARY;

    if (shouldUseAI) {
        console.log(`Text is ${transcriptionText.length} chars. Generating AI summary...`);

        try {
            const { summary, sections } = await summarizeAndStructure(transcriptionText);

            // Summary section
            docChildren.push(
                new Paragraph({
                    text: '📝 要約',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 300, after: 200 },
                }),
                new Paragraph({
                    children: [new TextRun({ text: summary })],
                    spacing: { after: 300 },
                })
            );

            // Structured content sections
            docChildren.push(
                new Paragraph({
                    text: '📚 内容',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 300, after: 200 },
                })
            );

            sections.forEach((section) => {
                docChildren.push(
                    new Paragraph({
                        text: `▶ ${section.heading}`,
                        heading: HeadingLevel.HEADING_3,
                        spacing: { before: 200, after: 100 },
                    })
                );

                section.content.split('\n').forEach((line) => {
                    docChildren.push(
                        new Paragraph({
                            children: [new TextRun({ text: line })],
                            spacing: { after: 100 },
                        })
                    );
                });
            });

            // Full transcript section
            docChildren.push(
                new Paragraph({
                    text: '📄 全文（元の文字起こし）',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 400, after: 200 },
                }),
                ...transcriptionText.split('\n').map(
                    (line) =>
                        new Paragraph({
                            children: [new TextRun({ text: line, size: 20 })], // Slightly smaller
                            spacing: { after: 80 },
                        })
                )
            );
        } catch (error) {
            console.error('AI summary failed, using simple format:', error);
            // Fallback to simple format
            docChildren.push(
                new Paragraph({
                    text: '文字起こし内容',
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 200 },
                }),
                ...transcriptionText.split('\n').map(
                    (line) =>
                        new Paragraph({
                            children: [new TextRun({ text: line })],
                            spacing: { after: 100 },
                        })
                )
            );
        }
    } else {
        // Simple format for short texts
        console.log(`Text is ${transcriptionText.length} chars. Using simple format.`);
        docChildren.push(
            new Paragraph({
                text: '文字起こし内容',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 200 },
            }),
            ...transcriptionText.split('\n').map(
                (line) =>
                    new Paragraph({
                        children: [new TextRun({ text: line })],
                        spacing: { after: 100 },
                    })
            )
        );
    }

    const doc = new Document({
        sections: [
            {
                properties: {},
                children: docChildren,
            },
        ],
    });

    // Save to temp directory (Vercel compatible)
    const tempDir = '/tmp';
    await fs.mkdir(tempDir, { recursive: true });

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const filename = `transcription_${year}-${month}-${day}_${hours}-${minutes}-${seconds}.docx`;
    const filepath = path.join(tempDir, filename);

    const { Packer } = await import('docx');
    const buffer = await Packer.toBuffer(doc);
    await fs.writeFile(filepath, buffer);

    return filepath;
}
