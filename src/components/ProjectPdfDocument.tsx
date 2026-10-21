import React from "react";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import type { StoryBlock } from "@/lib/types";
import { parseScriptText } from "@/lib/script-format";

const styles = StyleSheet.create({
  page: {
    paddingTop: 82,
    paddingBottom: 58,
    paddingHorizontal: 54,
    fontFamily: "Helvetica",
    fontSize: 9,
    lineHeight: 1.35,
    color: "#171717",
    backgroundColor: "#ffffff",
  },
  headerEyebrow: {
    position: "absolute",
    top: 28,
    left: 54,
  },
  headerProjectTitle: {
    position: "absolute",
    top: 42,
    left: 54,
    width: 430,
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.15,
  },
  headerLogo: {
    position: "absolute",
    top: 35,
    right: 54,
    width: 66,
    height: 15,
    objectFit: "contain",
  },
  headerRule: {
    position: "absolute",
    top: 65,
    left: 54,
    right: 54,
    height: 0.7,
    backgroundColor: "#b8b8b8",
  },
  eyebrow: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.1,
    color: "#555555",
    marginBottom: 2,
  },
  pageCounter: {
    position: "absolute",
    top: 68,
    left: 54,
    right: 54,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#363636",
    textAlign: "right",
  },
  block: { marginBottom: 17 },
  blockHeading: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
    paddingBottom: 5,
  },
  blockNumber: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    color: "#555555",
    marginBottom: 2,
  },
  blockTitle: { fontSize: 13, fontFamily: "Helvetica-Bold", lineHeight: 1.2 },
  columns: { flexDirection: "row", alignItems: "flex-start" },
  sceneColumn: { width: "50%", paddingRight: 12 },
  voiceColumn: {
    width: "50%",
    paddingLeft: 12,
    borderLeftWidth: 0.65,
    borderLeftColor: "#c7c7c7",
  },
  columnTitle: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    color: "#555555",
    marginBottom: 7,
  },
  item: {
    marginBottom: 8,
    paddingTop: 5,
    borderTopWidth: 0.45,
    borderTopColor: "#dedede",
  },
  itemHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 2 },
  itemHeaderContent: { flexGrow: 1, flexShrink: 1 },
  itemBody: { marginLeft: 16 },
  firstItem: { borderTopWidth: 0, paddingTop: 0 },
  checkbox: {
    width: 9,
    height: 9,
    marginTop: 2,
    marginRight: 7,
    borderWidth: 0.8,
    borderColor: "#555555",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxMark: { fontSize: 6, lineHeight: 1, fontFamily: "Helvetica-Bold" },
  retake: { color: "#8b2525" },
  itemNumber: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    color: "#555555",
    marginBottom: 2,
  },
  relatedShots: {
    fontSize: 6.8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.3,
    color: "#555555",
    marginBottom: 3,
  },
  description: { fontSize: 9, lineHeight: 1.35, marginBottom: 3 },
  sceneMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 2,
    marginBottom: 2,
  },
  sceneMetaChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.55,
    borderColor: "#c7c7c7",
    borderRadius: 2,
    paddingVertical: 2,
    paddingHorizontal: 4,
    marginRight: 4,
    marginBottom: 3,
  },
  sceneMetaText: { fontSize: 7, lineHeight: 1.2, color: "#222222" },
  sceneMetaLabel: { fontFamily: "Helvetica-Bold", color: "#3f3f3f" },
  detail: { fontSize: 7.5, lineHeight: 1.3, color: "#444444", marginTop: 1 },
  detailLabel: { fontFamily: "Helvetica-Bold", color: "#262626" },
  bold: { fontFamily: "Helvetica-Bold" },
  boldItalic: { fontFamily: "Helvetica-BoldOblique" },
  empty: { fontSize: 8, color: "#666666" },
  needsSection: { marginBottom: 13 },
  needsHeading: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.6,
    color: "#444444",
    marginBottom: 5,
  },
  needsGrid: { flexDirection: "row", flexWrap: "wrap" },
  needChip: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 0.55,
    borderColor: "#c7c7c7",
    borderRadius: 2,
    paddingVertical: 3,
    paddingHorizontal: 5,
    marginRight: 5,
    marginBottom: 4,
    maxWidth: "100%",
  },
  needLabel: { fontSize: 7.5, fontFamily: "Helvetica-Bold" },
  needShots: { fontSize: 6.8, color: "#555555", marginLeft: 4 },
  referencesHeading: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  referenceGrid: { flexDirection: "row", flexWrap: "wrap" },
  referenceCard: {
    width: "33.3333%",
    paddingHorizontal: 4,
    paddingBottom: 9,
  },
  referenceImage: {
    width: "100%",
    height: 132,
    objectFit: "contain",
    borderWidth: 0.6,
    borderColor: "#d4d4d4",
  },
});

function FormattedText({ value }: { value: string }) {
  return (
    <>
      {parseScriptText(value).map((segment, index) => (
        <Text
          key={index}
          hyphenationCallback={breakLongTokens}
          style={segment.bold ? (segment.italic ? styles.boldItalic : styles.bold) : undefined}
        >
          {segment.text}
        </Text>
      ))}
    </>
  );
}

// Break unusually long unspaced strings (such as pasted URLs) so they stay
// inside their column instead of running into the page margin.
function breakLongTokens(word: string) {
  if (word.length <= 28) return [word];
  return word.match(/.{1,20}/gu) ?? [word];
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Text style={styles.detail} hyphenationCallback={breakLongTokens}>
      <Text style={styles.detailLabel}>{label}: </Text>
      {parseScriptText(value).map((segment, index) => (
        <Text
          key={index}
          hyphenationCallback={breakLongTokens}
          style={segment.bold ? (segment.italic ? styles.boldItalic : styles.bold) : undefined}
        >
          {segment.text}
        </Text>
      ))}
    </Text>
  );
}

function SceneMetaChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.sceneMetaChip}>
      <Text style={styles.sceneMetaText} hyphenationCallback={breakLongTokens}>
        <Text style={styles.sceneMetaLabel}>{label}: </Text>
        {value}
      </Text>
    </View>
  );
}

export async function createProjectPdf(
  projectName: string,
  blocks: StoryBlock[],
  logoDataUrl: string,
  imageReferences: { id: string; dataUrl: string }[] = [],
) {
  let shotNumber = 0;
  const numberedBlocks = blocks.map((block) => ({
    ...block,
    scene: [...(block.scene ?? [])]
      .sort((a, b) => a.order - b.order)
      .map((scene) => ({
        scene,
        number: String(++shotNumber).padStart(2, "0"),
      })),
    voice_over: [...(block.voice_over ?? [])].sort((a, b) => a.order - b.order),
  }));
  const projectNeeds = new Map<string, { label: string; shots: string[] }>();
  for (const block of numberedBlocks) {
    for (const { scene, number } of block.scene) {
      for (const rawNeed of scene.requirements ?? []) {
        const label = rawNeed.trim();
        if (!label) continue;
        const key = label.toLocaleLowerCase();
        const entry = projectNeeds.get(key) ?? { label, shots: [] };
        if (!entry.shots.includes(number)) entry.shots.push(number);
        projectNeeds.set(key, entry);
      }
    }
  }
  const safeProjectName = projectName.length > 56
    ? `${projectName.slice(0, 53).trimEnd()}…`
    : projectName;

  const document = (
    <Document
      title={`Guion de rodaje · ${projectName}`}
      author="Scriptshot"
      creator="Scriptshot"
      subject="Guion de rodaje"
    >
      <Page size="LETTER" style={styles.page} wrap>
        <Text fixed style={[styles.eyebrow, styles.headerEyebrow]} render={() => "GUIÓN DE RODAJE"} />
        <Text fixed style={styles.headerProjectTitle} render={() => safeProjectName} />
        <Image fixed src={logoDataUrl} style={styles.headerLogo} />
        <View fixed style={styles.headerRule} />
        <Text fixed style={styles.pageCounter} render={({ pageNumber, totalPages }) => `${safeProjectName} · PÁGINA ${pageNumber}/${totalPages}`} />

        {projectNeeds.size > 0 && (
          <View style={styles.needsSection}>
            <Text style={styles.needsHeading}>NECESIDADES DE RODAJE</Text>
            <View style={styles.needsGrid}>
              {[...projectNeeds.values()].map((need) => (
                <View key={need.label.toLocaleLowerCase()} style={styles.needChip}>
                  <Text style={styles.needLabel}>
                    <FormattedText value={need.label} />
                  </Text>
                  <Text style={styles.needShots}>Tomas {need.shots.join(", ")}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {numberedBlocks.map((block, blockIndex) => (
          <View key={block.id} style={styles.block}>
            <View style={styles.blockHeading} wrap={false}>
              <Text style={styles.blockNumber} minPresenceAhead={36}>
                BLOQUE {String(blockIndex + 1).padStart(2, "0")}
              </Text>
              <Text style={styles.blockTitle} minPresenceAhead={36} hyphenationCallback={breakLongTokens}>{block.title}</Text>
            </View>

            <View style={styles.columns}>
              <View style={styles.sceneColumn}>
              <Text style={styles.columnTitle} minPresenceAhead={40}>ESCENAS</Text>
                {block.scene.length ? block.scene.map(({ scene, number }, index) => (
                  <View key={scene.id} style={[styles.item, ...(index === 0 ? [styles.firstItem] : [])]}>
                    <View style={styles.itemHeader} wrap={false}>
                      <View style={styles.checkbox}>
                        {scene.status === "grabada" && <Text style={styles.checkboxMark}>X</Text>}
                      </View>
                      <Text style={styles.itemNumber} minPresenceAhead={44}>
                        TOMA {number}{scene.status === "repetir" && <Text style={styles.retake}> · REPETIR</Text>}
                      </Text>
                    </View>
                    <View style={styles.itemBody}>
                      <Text style={styles.description} hyphenationCallback={breakLongTokens}>
                        <FormattedText value={scene.description || "Descripción pendiente"} />
                      </Text>
                      {(scene.location?.name || scene.camera || scene.angle || scene.movement || scene.requirements?.length || scene.notes || scene.post_production || scene.reference) && (
                        <View wrap={false}>
                          {(scene.location?.name || scene.camera || scene.angle || scene.movement) && (
                            <View style={styles.sceneMeta}>
                              {scene.location?.name && <SceneMetaChip label="Locación" value={scene.location.name} />}
                              {scene.camera && <SceneMetaChip label="Plano" value={scene.camera} />}
                              {scene.angle && <SceneMetaChip label="Ángulo" value={scene.angle} />}
                              {scene.movement && <SceneMetaChip label="Movimiento" value={scene.movement} />}
                            </View>
                          )}
                          {!!scene.requirements?.length && <Detail label="Necesidades" value={scene.requirements.join(", ")} />}
                          {scene.notes && <Detail label="Notas" value={scene.notes} />}
                          {scene.post_production && <Detail label="Postproducción" value={scene.post_production_notes || "Requiere postproducción"} />}
                          {scene.reference && <Detail label="Referencia" value={scene.reference} />}
                        </View>
                      )}
                    </View>
                  </View>
                )) : <Text style={styles.empty}>Sin escenas en este bloque.</Text>}
              </View>

              <View style={styles.voiceColumn}>
              <Text style={styles.columnTitle} minPresenceAhead={40}>VOZ EN OFF</Text>
                {block.voice_over.length ? block.voice_over.map((voiceOver, voiceIndex) => {
                  const relatedShots = block.scene
                    .filter(({ scene }) => scene.voice_over_id === voiceOver.id)
                    .map(({ number }) => number);
                  return (
                    <View key={voiceOver.id} style={[styles.item, ...(voiceIndex === 0 ? [styles.firstItem] : [])]}>
                      <View style={styles.itemHeader} wrap={false}>
                        <View style={styles.checkbox}>
                          {voiceOver.recorded && <Text style={styles.checkboxMark}>X</Text>}
                        </View>
                        <View style={styles.itemHeaderContent}>
                          <Text style={styles.itemNumber}>
                            VOZ {String(voiceIndex + 1).padStart(2, "0")}
                          </Text>
                          {relatedShots.length > 0 && <Text style={styles.relatedShots} hyphenationCallback={breakLongTokens}>TOMAS {relatedShots.join(", ")}</Text>}
                        </View>
                      </View>
                      <View style={styles.itemBody}>
                        <Text style={styles.description} hyphenationCallback={breakLongTokens}>
                          <FormattedText value={voiceOver.text || "Texto pendiente"} />
                        </Text>
                      </View>
                    </View>
                  );
                }) : <Text style={styles.empty}>Sin voz en off en este bloque.</Text>}
              </View>
            </View>
          </View>
        ))}

        {imageReferences.length > 0 && (
          <View break>
            <Text style={styles.referencesHeading}>REFERENTES VISUALES</Text>
            <View style={styles.referenceGrid}>
              {imageReferences.map((reference) => (
                <View key={reference.id} style={styles.referenceCard} wrap={false}>
                  <Image src={reference.dataUrl} style={styles.referenceImage} />
                </View>
              ))}
            </View>
          </View>
        )}

      </Page>
    </Document>
  );

  return pdf(document).toBlob();
}
